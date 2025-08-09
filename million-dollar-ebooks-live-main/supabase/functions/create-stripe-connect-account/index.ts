
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting Stripe Connect account creation...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabaseClient.auth.getUser(token)

    if (!user.user) {
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.user.email);

    // Try both possible secret key names
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('Stripe_key')
    if (!stripeSecretKey) {
      console.error('No Stripe secret key found. Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your edge function secrets.')
    }

    console.log('Stripe secret key found');

    const { email, country = 'US' } = await req.json()
    console.log('Creating account for:', email, 'in country:', country);

    // Create Stripe Connect account with proper capabilities format
    const formData = new URLSearchParams({
      type: 'express',
      country: country,
      email: email,
      'capabilities[card_payments][requested]': 'true',
      'capabilities[transfers][requested]': 'true',
    });

    const response = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const account = await response.json()
    console.log('Stripe account creation response:', account);

    if (!response.ok) {
      console.error('Stripe account creation failed:', account);
      throw new Error(account.error?.message || 'Failed to create Stripe account')
    }

    // Update user profile with Stripe Connect account ID
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        stripe_connect_account_id: account.id,
        stripe_onboarding_completed: false,
        stripe_payouts_enabled: false
      })
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw updateError
    }

    console.log('Profile updated with Stripe account ID:', account.id);

    // Create onboarding link
    const onboardingResponse = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        account: account.id,
        type: 'account_onboarding',
        refresh_url: `${req.headers.get('origin')}/dashboard?stripe_refresh=true`,
        return_url: `${req.headers.get('origin')}/dashboard?stripe_success=true`,
      }),
    })

    const onboardingLink = await onboardingResponse.json()
    console.log('Onboarding link created:', onboardingLink.url);

    if (!onboardingResponse.ok) {
      console.error('Failed to create onboarding link:', onboardingLink);
      throw new Error(onboardingLink.error?.message || 'Failed to create onboarding link')
    }

    return new Response(
      JSON.stringify({ 
        accountId: account.id, 
        onboardingUrl: onboardingLink.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-stripe-connect-account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})


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
    console.log('Checking Stripe account status...');

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

    // Get user's Stripe Connect account ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', user.user.id)
      .single()

    if (!profile?.stripe_connect_account_id) {
      throw new Error('No Stripe account found')
    }

    console.log('Found Stripe account:', profile.stripe_connect_account_id);

    // Try both possible secret key names
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('Stripe_key')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Check account status with Stripe
    const response = await fetch(`https://api.stripe.com/v1/accounts/${profile.stripe_connect_account_id}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })

    const account = await response.json()
    console.log('Stripe account status:', account);

    if (!response.ok) {
      console.error('Failed to check account status:', account);
      throw new Error(account.error?.message || 'Failed to check account status')
    }

    const onboardingCompleted = account.details_submitted
    const payoutsEnabled = account.payouts_enabled

    console.log('Account status - onboarding:', onboardingCompleted, 'payouts:', payoutsEnabled);

    // Update profile with current status
    let updateData = { 
      stripe_onboarding_completed: onboardingCompleted,
      stripe_payouts_enabled: payoutsEnabled
    };

    // If both onboarding and payouts are enabled, verify the user
    if (onboardingCompleted && payoutsEnabled) {
      updateData.is_verified = true;
      console.log('User is fully connected, setting verified status');
    }

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Failed to update profile:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        onboardingCompleted,
        payoutsEnabled,
        accountId: profile.stripe_connect_account_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in check-stripe-account-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

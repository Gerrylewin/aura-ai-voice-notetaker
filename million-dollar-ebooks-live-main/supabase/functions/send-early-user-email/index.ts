
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  to: string
  subject: string
  html: string
}

const sendEmail = async (emailData: EmailData) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Million Dollar eBooks <noreply@dollarebooks.app>',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

const createEarlyUserEmail = (displayName: string, memberNumber: number) => ({
  subject: "🎉 You're one of our first 100 users - Founding Member Status!",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #dc2626; font-size: 32px; margin-bottom: 10px;">🎉 Congratulations!</h1>
        <p style="color: #666; font-size: 20px;">You're Founding Member #${memberNumber}!</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; border-radius: 15px; margin-bottom: 30px; color: white; text-align: center;">
        <h2 style="margin: 0 0 15px 0; font-size: 24px;">👑 Founding Member Status Unlocked!</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">You now have exclusive founding member privileges</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 20px;">Hello ${displayName}! 👋</h3>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          As one of our first 100 users, you've been granted <strong>Founding Member Status</strong> with exclusive privileges:
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
          <h4 style="color: #dc2626; margin-bottom: 15px;">🎁 Your Founding Member Benefits:</h4>
          <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Exclusive founding member badge on your profile</li>
            <li>Direct line to the developer for feedback</li>
            <li>Priority support and feature requests</li>
            <li>Cash rewards for bug reports and testing</li>
            <li>Lifetime recognition as a founding member</li>
          </ul>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 15px;">🚀 Help Us Grow - Explore These Features!</h4>
          <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Chat with the Community:</strong> Join our public chat and connect with other readers and writers</li>
            <li><strong>Write Daily Stories:</strong> Share your creativity with daily story submissions</li>
            <li><strong>Discover Books:</strong> Browse our growing library of $1 books</li>
            <li><strong>Leave Reviews:</strong> Help other readers find great content</li>
            <li><strong>Use All Features:</strong> The more you explore, the better we can make the platform!</li>
          </ul>
        </div>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h4 style="color: #856404; margin-bottom: 15px;">💰 Get Paid for Helping!</h4>
        <p style="color: #856404; margin: 0; line-height: 1.6;">
          Found a bug? Have feedback? Report it on our <strong>Support Page</strong> and I'll literally send you cash through your Stripe account! 
          The more you help me develop and test the app, the more you earn. Your usage and feedback are invaluable for making improvements.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://rnbnldbiqzzbxudcjynv.supabase.co', 'https://dollarebooks.app') || 'https://dollarebooks.app'}/support" 
           style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 15px;">
          Report Bugs & Get Paid →
        </a>
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://rnbnldbiqzzbxudcjynv.supabase.co', 'https://dollarebooks.app') || 'https://dollarebooks.app'}/dashboard" 
           style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Explore the Platform
        </a>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Thank you for being part of the Million Dollar eBooks founding community! 🚀
        </p>
        <p style="color: #999; font-size: 12px; margin: 0;">
          Questions? Just reply to this email - I read every single one personally.
        </p>
      </div>
    </div>
  `,
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get users who haven't received the founding member email yet (first 100 based on member_number)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, member_number, is_verified, created_at')
      .not('member_number', 'is', null)
      .lte('member_number', 100)
      .eq('is_verified', false) // Only users who haven't received the email
      .order('member_number', { ascending: true })
      .limit(50) // Process in batches

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          totalSent: 0,
          totalFailed: 0,
          message: 'No new founding members to email'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get user emails from auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`)
    }

    const emailResults = []
    let successCount = 0
    let errorCount = 0

    // Send emails to eligible founding members
    for (const profile of profiles) {
      const user = users.users.find(u => u.id === profile.id)
      if (!user?.email || !profile.member_number) continue

      try {
        const emailContent = createEarlyUserEmail(
          profile.display_name || user.email.split('@')[0], 
          profile.member_number
        )
        const result = await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html
        })
        
        console.log(`Founding member email sent successfully to ${user.email}:`, result)
        emailResults.push({ email: user.email, status: 'success', result })
        successCount++

        // Mark this user as having received the founding member email
        await supabase
          .from('profiles')
          .update({ 
            is_verified: true,
            // Remove founding member text from bio if it exists
            bio: profile.bio ? profile.bio.replace(/\| Founding Member.*?First 100 Users/g, '').replace(/Founding Member.*?First 100 Users/g, '').trim() : null
          })
          .eq('id', profile.id)

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (emailError) {
        console.error(`Failed to send founding member email to ${user.email}:`, emailError)
        emailResults.push({ email: user.email, status: 'error', error: emailError.message })
        errorCount++
      }
    }

    console.log(`Founding member email campaign: ${successCount} new emails sent`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent: successCount,
        totalFailed: errorCount,
        results: emailResults 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error in send-early-user-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})


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

interface NotificationRequest {
  title: string
  message: string
  userGroup: 'all' | 'readers' | 'writers' | 'moderators' | 'admins'
  sendInApp: boolean
  sendEmail: boolean
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

const createNotificationEmail = (title: string, message: string, displayName: string) => ({
  subject: title,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">Million Dollar eBooks</h1>
        <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">${title}</h2>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 20px;">Hello ${displayName}! 👋</h3>
        
        <div style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://rnbnldbiqzzbxudcjynv.supabase.co', 'https://dollarebooks.app') || 'https://dollarebooks.app'}/dashboard" 
           style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Go to Dashboard →
        </a>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Thank you for being part of the Million Dollar eBooks community! 🚀
        </p>
        <p style="color: #999; font-size: 12px; margin: 0;">
          Questions? Just reply to this email.
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
    const { title, message, userGroup, sendInApp, sendEmail }: NotificationRequest = await req.json()

    if (!title || !message) {
      throw new Error('Title and message are required')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Build the query based on user group
    let profilesQuery = supabase.from('profiles').select('id, display_name, user_role')

    if (userGroup !== 'all') {
      profilesQuery = profilesQuery.eq('user_role', userGroup)
    }

    const { data: profiles, error: profileError } = await profilesQuery

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ totalSent: 0, totalFailed: 0, message: 'No users found for the selected group' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    let successCount = 0
    let errorCount = 0
    const results = []

    // Get user emails if we need to send emails
    let userEmails: { [key: string]: string } = {}
    if (sendEmail) {
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) {
        throw new Error(`Failed to fetch user emails: ${userError.message}`)
      }
      
      userEmails = users.users.reduce((acc, user) => {
        if (user.email) acc[user.id] = user.email
        return acc
      }, {} as { [key: string]: string })
    }

    // Process each user
    for (const profile of profiles) {
      try {
        // Send in-app notification
        if (sendInApp) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: profile.id,
              type: 'admin_announcement',
              title: title,
              message: message,
              data: { userGroup, sentBy: 'admin' }
            })

          if (notificationError) {
            console.error(`Failed to create in-app notification for ${profile.id}:`, notificationError)
          }
        }

        // Send email notification
        if (sendEmail && userEmails[profile.id]) {
          const emailContent = createNotificationEmail(
            title, 
            message, 
            profile.display_name || userEmails[profile.id].split('@')[0]
          )
          
          await sendEmail({
            to: userEmails[profile.id],
            subject: emailContent.subject,
            html: emailContent.html
          })

          console.log(`Email sent successfully to ${userEmails[profile.id]}`)
        }

        results.push({ userId: profile.id, status: 'success' })
        successCount++

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to send notification to ${profile.id}:`, error)
        results.push({ userId: profile.id, status: 'error', error: error.message })
        errorCount++
      }
    }

    console.log(`Notification campaign completed: ${successCount} successful, ${errorCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent: successCount,
        totalFailed: errorCount,
        results: results 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error in send-group-notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReleaseNotificationRequest {
  version: string
  title: string
  message: string
  dashboardUrl?: string
  releaseNotesUrl?: string
  chatUrl?: string
}

const sendEmail = async (emailData: { to: string; subject: string; html: string }) => {
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

const createReleaseNotificationEmail = (
  version: string, 
  title: string, 
  message: string, 
  displayName: string,
  dashboardUrl: string = 'https://dollarebooks.app/dashboard',
  releaseNotesUrl: string = 'https://dollarebooks.app/release-notes'
) => ({
  subject: `🚀 New Release v${version}: ${title}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">Million Dollar eBooks</h1>
        <h2 style="color: #333; font-size: 24px; margin-bottom: 10px;">🚀 New Release v${version}</h2>
        <h3 style="color: #555; font-size: 20px; margin-bottom: 20px;">${title}</h3>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 20px;">Hello ${displayName}! 👋</h3>
        
        <div style="color: #555; line-height: 1.6; margin-bottom: 20px;">
          ${message}
        </div>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h4 style="color: #333; margin-bottom: 15px;">✨ What's New in v${version}</h4>
          <p style="color: #555; line-height: 1.6; margin: 0;">
            Check out the full release notes to see all the exciting improvements and new features we've added for you!
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${releaseNotesUrl}" 
           style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
           📋 View Full Release Notes
        </a>
        <a href="${dashboardUrl}" 
           style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
           🎯 Go to Dashboard
        </a>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
          Thank you for being part of the Million Dollar eBooks community! 🚀
        </p>
        <p style="color: #999; font-size: 12px; margin: 0;">
          Keep creating amazing content, and happy reading! 📚
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
    const { 
      version, 
      title, 
      message, 
      dashboardUrl, 
      releaseNotesUrl 
    }: ReleaseNotificationRequest = await req.json()

    if (!version || !title || !message) {
      throw new Error('Version, title, and message are required')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Check who has already received this specific release notification
    const { data: alreadyNotified, error: notifiedCheckError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'release_notes_update')
      .eq('data->>version', version)

    if (notifiedCheckError) {
      console.error('Error checking already notified users:', notifiedCheckError)
    }

    const alreadyNotifiedUserIds = new Set(alreadyNotified?.map(n => n.user_id) || [])
    console.log(`${alreadyNotifiedUserIds.size} users already notified for v${version}`)

    // Get all user profiles, excluding those already notified
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ totalSent: 0, totalFailed: 0, message: 'No users found' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Filter out users who have already been notified
    const usersToNotify = profiles.filter(profile => !alreadyNotifiedUserIds.has(profile.id))
    
    if (usersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ 
          totalSent: 0, 
          totalFailed: 0, 
          alreadyNotified: alreadyNotifiedUserIds.size,
          message: `All users already notified for v${version}` 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    let successCount = 0
    let errorCount = 0

    // Get user emails for email notifications
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      throw new Error(`Failed to fetch user emails: ${userError.message}`)
    }
    
    const userEmails: { [key: string]: string } = users.users.reduce((acc, user) => {
      if (user.email) acc[user.id] = user.email
      return acc
    }, {} as { [key: string]: string })

    // Process each user who hasn't been notified yet
    for (const profile of usersToNotify) {
      try {
        // Send in-app notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            type: 'release_notes_update',
            title: `🚀 New Release v${version}: ${title}`,
            message: message,
            data: { 
              version, 
              releaseType: 'release',
              viewReleaseNotes: '/release-notes'
            }
          })

        if (notificationError) {
          console.error(`Failed to create in-app notification for ${profile.id}:`, notificationError)
        }

        // Send email notification if user has email
        if (userEmails[profile.id]) {
          const emailContent = createReleaseNotificationEmail(
            version, 
            title, 
            message, 
            profile.display_name || userEmails[profile.id].split('@')[0],
            dashboardUrl,
            releaseNotesUrl
          )
          
          await sendEmail({
            to: userEmails[profile.id],
            subject: emailContent.subject,
            html: emailContent.html
          })

          console.log(`Release notification sent successfully to ${userEmails[profile.id]}`)
        }

        successCount++

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to send release notification to ${profile.id}:`, error)
        errorCount++
      }
    }

    console.log(`Release notification campaign completed: ${successCount} successful, ${errorCount} failed, ${alreadyNotifiedUserIds.size} already notified`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent: successCount,
        totalFailed: errorCount,
        alreadyNotified: alreadyNotifiedUserIds.size,
        version,
        title
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error in notify-release-update function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})

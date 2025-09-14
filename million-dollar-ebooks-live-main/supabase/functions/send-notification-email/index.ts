
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  to: string
  subject: string
  html: string
  type: 'welcome' | 'purchase_confirmation' | 'new_review' | 'book_published' | 'upgrade_confirmation' | 'comment_notification' | 'gift_notification' | 'message_notification' | 'new_book_from_favorite' | 'new_story_from_favorite'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }

  try {
    const body = await req.text()
    console.log('Received request body:', body)
    
    if (!body || body.trim() === '') {
      throw new Error('Empty request body')
    }

    const { to, subject, html, type }: EmailData = JSON.parse(body)
    
    console.log('Parsed email data:', { to, subject, type })

    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, or html')
    }

    const emailPayload = {
      from: 'Million Dollar eBooks <noreply@dollarebooks.app>',
      to: [to],
      subject,
      html,
    }

    console.log('Sending email with payload:', emailPayload)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const responseText = await response.text()
    console.log('Resend API response:', responseText)

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${responseText}`)
    }

    const result = JSON.parse(responseText)
    
    console.log(`Email sent successfully: ${type} to ${to}`, result)

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error('Error in send-notification-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})

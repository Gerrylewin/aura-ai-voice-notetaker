
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  targetUserId: string;
  senderName: string;
  conversationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { targetUserId, senderName, conversationId }: NotificationRequest = await req.json();

    console.log('Sending private chat notification to user:', targetUserId);

    // Get target user details
    const { data: targetUser, error: userError } = await supabaseClient
      .from('profiles')
      .select('display_name, email')
      .eq('id', targetUserId)
      .single();

    if (userError) {
      console.error('Error fetching target user:', userError);
      throw userError;
    }

    // Create in-app notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'admin_private_message',
        title: 'New Private Message',
        message: `${senderName} sent you a private message. Click to view and respond.`,
        data: {
          sender_name: senderName,
          conversation_id: conversationId,
          deep_link: `/chat?conversation=${conversationId}`
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Send email notification
    if (targetUser.email) {
      const deepLink = `${Deno.env.get('SITE_URL') || 'https://milliondollarebooks.com'}/chat?conversation=${conversationId}`;
      
      const emailResponse = await resend.emails.send({
        from: "Million Dollar eBooks <admin@milliondollarebooks.com>",
        to: [targetUser.email],
        subject: `New private message from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">New Private Message</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${targetUser.display_name || 'there'}! 👋</h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                <strong>${senderName}</strong> has sent you a private message on Million Dollar eBooks.
              </p>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="color: #555; margin-bottom: 15px;">
                  Click the button below to view your message and respond directly in the chat.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${deepLink}" 
                 style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Message →
              </a>
            </div>
            
            <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #666; font-size: 14px;">
                This is an automated message from the Million Dollar eBooks platform.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                The Million Dollar eBooks Team
              </p>
            </div>
          </div>
        `,
      });

      console.log('Email notification sent:', emailResponse);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-private-chat-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

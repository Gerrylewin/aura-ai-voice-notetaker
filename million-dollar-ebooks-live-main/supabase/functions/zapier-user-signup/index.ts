
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Zapier webhook triggered for user signup');

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.json();
    console.log('Received webhook data:', body);

    // Extract user data from the request
    const { user_email, user_name, user_id, signup_timestamp } = body;

    if (!user_email) {
      return new Response(
        JSON.stringify({ error: 'user_email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the signup event
    console.log(`Processing signup for: ${user_email}, Name: ${user_name || 'Not provided'}`);

    // Prepare response data for Zapier
    const responseData = {
      success: true,
      message: 'User signup webhook processed successfully',
      data: {
        email: user_email,
        name: user_name || user_email.split('@')[0],
        user_id: user_id,
        signup_timestamp: signup_timestamp || new Date().toISOString(),
        webhook_processed_at: new Date().toISOString()
      }
    };

    console.log('Sending response to Zapier:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing Zapier webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

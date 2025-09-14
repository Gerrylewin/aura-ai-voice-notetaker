
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event, userId, email, userData } = await req.json();
    
    console.log('Processing user event:', { event, userId, email, userData });

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists, updating email confirmation status');
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          email_confirmed_at: new Date().toISOString(),
          requires_authentication: false
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating existing profile:', updateError);
        throw updateError;
      }

      // Send admin notification for login
      try {
        await supabaseClient
          .from('admin_user_notifications')
          .insert({
            admin_id: '00000000-0000-0000-0000-000000000000', // Will be replaced by trigger
            notification_type: 'user_login',
            user_id: userId,
            user_email: email,
            user_display_name: updatedProfile.display_name || email,
            user_role: updatedProfile.user_role || 'reader',
            activity_data: {
              login_timestamp: new Date().toISOString(),
              event_type: event
            }
          });
      } catch (notifError) {
        console.error('Failed to create admin notification:', notifError);
      }

      return new Response(
        JSON.stringify({ success: true, profile: updatedProfile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a unique username with better suggestions
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let attempts = 0;
    const suggestions = [];
    
    // Check if username exists and generate a unique one
    while (attempts < 10) {
      const { data: existingUser } = await supabaseClient
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (!existingUser) {
        break; // Username is available
      }
      
      // Username taken, try with different suffixes
      attempts++;
      if (attempts <= 3) {
        username = `${baseUsername}${attempts}`;
        suggestions.push(username);
      } else if (attempts <= 6) {
        // Add random numbers
        const randomNum = Math.floor(Math.random() * 999) + 1;
        username = `${baseUsername}${randomNum}`;
        suggestions.push(username);
      } else {
        // Add year or timestamp-based suffix
        const year = new Date().getFullYear();
        username = `${baseUsername}${year}`;
        suggestions.push(username);
      }
    }
    
    if (attempts >= 10) {
      // If still can't find a unique username, use timestamp
      username = `${baseUsername}${Date.now()}`;
    }
    
    console.log('Creating profile with username:', username);
    if (suggestions.length > 0) {
      console.log('Username suggestions generated:', suggestions);
    }

    // Create profile for new user
    const { data: newProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: userId,
        display_name: userData.display_name || email.split('@')[0],
        username: username,
        user_role: userData.user_role || 'reader',
        profile_completed: false,
        email_confirmed_at: new Date().toISOString(),
        requires_authentication: false
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      
      // If it's a username conflict, provide helpful error message
      if (profileError.code === '23505' && profileError.message.includes('username')) {
        throw new Error(`The username "${baseUsername}" is already taken. You could try: ${suggestions.slice(0, 3).join(', ')} or choose a different display name during onboarding.`);
      }
      
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('Profile created successfully:', newProfile);

    // Create admin notification for new user signup
    try {
      // Get all admin users
      const { data: admins } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('user_role', 'admin');

      if (admins && admins.length > 0) {
        // Create notifications for all admins
        const notifications = admins.map(admin => ({
          admin_id: admin.id,
          notification_type: 'new_user_signup',
          user_id: userId,
          user_email: email,
          user_display_name: newProfile.display_name || email,
          user_role: newProfile.user_role || 'reader',
          activity_data: {
            signup_timestamp: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            user_metadata: userData
          }
        }));

        await supabaseClient
          .from('admin_user_notifications')
          .insert(notifications);

        console.log('Admin notifications created for new user signup');
      }
    } catch (notifError) {
      console.error('Failed to create admin notifications:', notifError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: newProfile,
        usernameSuggestions: suggestions.length > 0 ? suggestions.slice(0, 3) : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handle-new-user-signup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

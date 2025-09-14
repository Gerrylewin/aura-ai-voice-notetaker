
import { UserSignUpData } from '@/hooks/auth/types';

/**
 * Integration service for external services
 * Handles email sending and webhook triggers
 */
export class IntegrationService {
  /**
   * Trigger Zapier webhook for new user signups
   */
  static async triggerZapierWebhook(userEmail: string, userName: string, userId: string) {
    try {
      console.log('Triggering Zapier webhook for new user signup');
      
      const response = await fetch('https://hooks.zapier.com/hooks/catch/19257464/2v8rygx/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          user_id: userId,
          signup_timestamp: new Date().toISOString(),
          triggered_from: window.location.origin
        })
      });

      console.log('Zapier webhook triggered successfully');
    } catch (error) {
      console.error('Failed to trigger Zapier webhook:', error);
      // Don't fail the signup if webhook fails
    }
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(email: string, userData: UserSignUpData) {
    try {
      console.log('Attempting to send welcome email to:', email);
      
      const { sendEmail, emailTemplates } = await import('@/utils/emailService');
      const template = emailTemplates.welcome(userData.display_name || email, userData.user_role || 'reader');
      
      console.log('Sending email with template:', template);
      
      const emailResult = await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        type: 'welcome'
      });
      
      console.log('Welcome email sent successfully:', emailResult);
      return { error: null };
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      return { error: emailError };
    }
  }
}


import { supabase } from '@/integrations/supabase/client';

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'welcome' | 'purchase_confirmation' | 'new_review' | 'book_published' | 'upgrade_confirmation' | 'comment_notification' | 'gift_notification' | 'message_notification' | 'new_book_from_favorite' | 'new_story_from_favorite' | 'early_user_special';
}

export const sendEmail = async (emailData: EmailNotification) => {
  try {
    console.log('Sending email via edge function:', emailData);
    
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: emailData,
    });

    if (error) {
      console.error('Supabase function invoke error:', error);
      throw error;
    }
    
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send early user special email to all first 100 users
export const sendEarlyUserEmails = async () => {
  try {
    console.log('Triggering early user email campaign...');
    
    const { data, error } = await supabase.functions.invoke('send-early-user-email');

    if (error) {
      console.error('Error sending early user emails:', error);
      throw error;
    }
    
    console.log('Early user emails sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in early user email campaign:', error);
    throw error;
  }
};

// Check if user has email notifications enabled for a specific type
export const checkNotificationPreference = async (userId: string, notificationType: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select(notificationType)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to true if we can't check
    }

    return data?.[notificationType] ?? true;
  } catch (error) {
    console.error('Error checking notification preference:', error);
    return true; // Default to true if we can't check
  }
};

// Send notification with preference check
export const sendNotificationEmail = async (
  userId: string, 
  emailData: EmailNotification, 
  preferenceType: string
) => {
  const hasPreference = await checkNotificationPreference(userId, preferenceType);
  
  if (!hasPreference) {
    console.log(`User ${userId} has disabled ${preferenceType} notifications`);
    return;
  }
  
  return sendEmail(emailData);
};

// Email templates
export const emailTemplates = {
  welcome: (displayName: string, userRole: string) => ({
    subject: `Welcome to Million Dollar eBooks, ${displayName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 10px;">Welcome to Million Dollar eBooks!</h1>
          <p style="color: #666; font-size: 18px;">Your ${userRole} journey begins now</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${displayName}! 👋</h2>
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Million Dollar eBooks as a ${userRole}! We're excited to have you in our community.
          </p>
          
          ${userRole === 'writer' 
            ? `<div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h3 style="color: #dc2626; margin-bottom: 15px;">🖋️ Your Writer Benefits:</h3>
                <ul style="color: #555; line-height: 1.8;">
                  <li>Publish unlimited books and stories</li>
                  <li>Earn 90% of every sale</li>
                  <li>Access to advanced analytics</li>
                  <li>Connect directly with your readers</li>
                  <li>Daily story competition with cash prizes</li>
                </ul>
              </div>`
            : `<div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="color: #2563eb; margin-bottom: 15px;">📚 Your Reader Benefits:</h3>
                <ul style="color: #555; line-height: 1.8;">
                  <li>Access to thousands of books for just $1 each</li>
                  <li>Free public domain classics</li>
                  <li>Daily stories from talented writers</li>
                  <li>Connect with authors and other readers</li>
                  <li>Personalized book recommendations</li>
                </ul>
              </div>`
          }
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${window.location.origin}/onboarding?type=${userRole}" 
             style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Complete Your ${userRole === 'writer' ? 'Writer' : 'Reader'} Setup →
          </a>
        </div>
        
        <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="color: #666; font-size: 14px;">
            Need help? Reply to this email or visit our 
            <a href="${window.location.origin}/support" style="color: #dc2626;">support center</a>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            The Million Dollar eBooks Team
          </p>
        </div>
      </div>
    `,
  }),

  writerUpgrade: (displayName: string) => ({
    subject: 'Welcome to the Writer Community!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations, ${displayName}!</h1>
        <p>Your account has been successfully upgraded to a Writer account.</p>
        <p>You can now:</p>
        <ul>
          <li>Publish your own books</li>
          <li>Earn 90% of every sale</li>
          <li>Access advanced writer tools</li>
          <li>Connect with your readers</li>
        </ul>
        <p>Start your writing journey today and join thousands of successful authors on our platform!</p>
        <p>Happy writing!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  moderatorUpgrade: (displayName: string) => ({
    subject: 'Welcome to the Moderation Team!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations, ${displayName}!</h1>
        <p>Your request to become a moderator has been approved!</p>
        <p>As a moderator, you can now:</p>
        <ul>
          <li>Help review flagged content</li>
          <li>Assist in maintaining community guidelines</li>
          <li>Support other community members</li>
          <li>Access the moderation panel</li>
        </ul>
        <p>Thank you for helping keep our community safe and welcoming!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  purchaseConfirmation: (bookTitle: string, authorName: string, price: string) => ({
    subject: `Purchase Confirmation: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Purchase Confirmed!</h1>
        <p>Thank you for purchasing <strong>${bookTitle}</strong> by ${authorName}.</p>
        <p>Amount paid: ${price}</p>
        <p>Your book is now available in your library. You can start reading immediately!</p>
        <p>Thank you for supporting independent authors.</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  newReview: (bookTitle: string, rating: number, reviewText: string) => ({
    subject: `New Review for "${bookTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">You received a new review!</h1>
        <p>Someone just reviewed your book <strong>${bookTitle}</strong>.</p>
        <p><strong>Rating:</strong> ${rating}/5 stars</p>
        ${reviewText ? `<p><strong>Review:</strong> "${reviewText}"</p>` : ''}
        <p>Keep up the great work!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  bookPublished: (bookTitle: string) => ({
    subject: `Your book "${bookTitle}" is now live!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Congratulations! Your book is published!</h1>
        <p>Your book <strong>${bookTitle}</strong> has been successfully published and is now available to readers worldwide.</p>
        <p>Readers can now discover and purchase your book. You'll earn 90% of every sale!</p>
        <p>Share your book with friends and social media to boost visibility.</p>
        <p>Good luck with your sales!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  commentNotification: (commenterName: string, contentTitle: string, contentType: string) => ({
    subject: `New comment on your ${contentType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Comment!</h1>
        <p><strong>${commenterName}</strong> left a comment on your ${contentType} <strong>"${contentTitle}"</strong>.</p>
        <p>Check out what they had to say and join the conversation!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  giftNotification: (gifterName: string, bookTitle: string, giftMessage?: string) => ({
    subject: `You received a book gift!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">You've Got a Gift! 🎁</h1>
        <p><strong>${gifterName}</strong> sent you a copy of <strong>"${bookTitle}"</strong>!</p>
        ${giftMessage ? `<p><strong>Message:</strong> "${giftMessage}"</p>` : ''}
        <p>The book is now available in your library. Happy reading!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  messageNotification: (senderName: string) => ({
    subject: `New message from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Message!</h1>
        <p>You have a new message from <strong>${senderName}</strong>.</p>
        <p>Log in to your account to read and reply to their message.</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  newBookFromFavorite: (authorName: string, bookTitle: string) => ({
    subject: `New book from ${authorName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Book Alert! 📚</h1>
        <p>Great news! <strong>${authorName}</strong>, one of your favorite authors, just published a new book:</p>
        <h2 style="color: #dc2626;">"${bookTitle}"</h2>
        <p>Check it out now and be among the first to read their latest work!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),

  newStoryFromFavorite: (authorName: string, storyTitle: string) => ({
    subject: `New story from ${authorName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Story Alert! ✨</h1>
        <p><strong>${authorName}</strong>, one of your favorite authors, just shared a new daily story:</p>
        <h2 style="color: #dc2626;">"${storyTitle}"</h2>
        <p>Read it now and show your support with a reaction!</p>
        <p>The Million Dollar eBooks Team</p>
      </div>
    `,
  }),
};

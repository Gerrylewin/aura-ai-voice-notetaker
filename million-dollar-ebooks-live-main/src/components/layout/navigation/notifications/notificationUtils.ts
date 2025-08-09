import { Database } from '@/integrations/supabase/types';
import { Bell, BookOpen, Heart, MessageSquare, DollarSign, Trophy, Rocket, Users, UserPlus, Flag, HelpCircle } from 'lucide-react';

type Notification = Database['public']['Tables']['notifications']['Row'];

export const getNotificationMessage = (notification: Notification): string => {
  const data = notification.data as any;
  
  switch (notification.type) {
    case 'new_story':
      return `📖 "${data?.title || 'A new story'}" by ${data?.author || 'an author'} has been published! Discover fresh content in the Stories section.`;
    case 'story_reaction':
      return `❤️ ${data?.reacter_name || 'Someone'} reacted with love to your story "${data?.story_title || 'your story'}"! Your writing is resonating with readers.`;
    case 'comment':
      return `💬 ${data?.commenter_name || 'A reader'} commented on your story "${data?.story_title || 'your story'}": "${(data?.comment_preview || 'Great story!').substring(0, 50)}${data?.comment_preview?.length > 50 ? '...' : ''}"`;
    case 'book_purchase':
      return `🎉 Ka-ching! Someone just purchased your book "${data?.book_title || 'your book'}" for $${data?.amount || '1.00'}. You're earning from your writing talent!`;
    case 'achievement_unlocked':
      return `🏆 Achievement Unlocked: "${data?.achievement_name || 'New Milestone'}"! You've earned ${data?.points || 0} points. Keep up the amazing work!`;
    case 'release_notes_update':
      return `🚀 Platform Update Available: "${data?.title || 'New features and improvements'}" - Check out the latest enhancements and features we've added for you.`;
    case 'early_user_campaign':
      return `🎊 Welcome to Million Dollar eBooks! You're one of our valued founding members. Get started by exploring your dashboard and publishing your first content.`;
    case 'new_book_submitted':
      return `📚 New Book Submission: "${data?.book_title || 'Untitled Book'}" by ${data?.author_name || 'Unknown Author'} has been submitted and is awaiting your review.`;
    case 'new_story_published':
      return `✨ Fresh Content Alert: "${data?.story_title || 'New Story'}" by ${data?.author_name || 'an author'} just went live! Check it out in the content review section.`;
    case 'new_user_signup':
      return `👋 New Member Joined: ${data?.user_name || 'A new user'} (${data?.user_email || 'email@domain.com'}) just signed up and is exploring the platform.`;
    case 'user_login':
      return `🔐 User Activity: ${data?.user_name || 'A member'} just logged in and is active on the platform. Community engagement is growing!`;
    case 'content_flagged':
      return `⚠️ Content Flagged: "${data?.content_title || 'Some content'}" has been reported by a user and requires your moderation attention.`;
    case 'support_request':
      return `🎧 Support Request: "${data?.subject || 'Help needed'}" from ${data?.user_name || 'a user'}. Category: ${data?.category || 'General'}. Please review and respond promptly.`;
    case 'moderator_invitation':
      return `👑 Moderator Invitation: An invitation has been sent to ${data?.email || 'a user'} to join the moderation team and help manage the platform.`;
    case 'book_pending_review':
      return `📋 Book Under Review: Your book "${data?.book_title || 'your latest work'}" has been submitted for review. Our team will review it shortly and notify you once it's approved for publication.`;
    case 'book_approved':
      return `🎉 Book Approved: Congratulations! Your book "${data?.book_title || 'your book'}" has been approved and is now live on the platform. Start earning from your writing!`;
    case 'book_rejected':
      return `📝 Book Needs Revision: Your book "${data?.book_title || 'your book'}" needs some adjustments before publication. Check the feedback and resubmit when ready.`;
    default:
      return notification.message || `📢 You have a new notification about ${notification.type?.replace('_', ' ') || 'platform activity'}. Click to view details in your dashboard.`;
  }
};

export const getNotificationLink = (notification: Notification): string => {
  const data = notification.data as any;
  
  switch (notification.type) {
    case 'new_story':
      return '/stories';
    case 'story_reaction':
    case 'comment':
      return '/stories';
    case 'book_purchase':
      return '/dashboard';
    case 'achievement_unlocked':
      return '/dashboard';
    case 'release_notes_update':
      return '/release-notes';
    case 'early_user_campaign':
      return '/dashboard';
    case 'new_book_submitted':
      return '/dashboard';
    case 'new_story_published':
      return '/dashboard';
    case 'new_user_signup':
      return '/dashboard';
    case 'user_login':
      return '/dashboard';
    case 'content_flagged':
      return '/dashboard';
    case 'support_request':
      return '/dashboard';
    case 'moderator_invitation':
      return '/dashboard';
    case 'book_pending_review':
      return '/dashboard';
    case 'book_approved':
      return '/dashboard';
    case 'book_rejected':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

export const getNotificationIcon = (notification: Notification) => {
  switch (notification.type) {
    case 'new_story':
      return BookOpen;
    case 'story_reaction':
      return Heart;
    case 'comment':
      return MessageSquare;
    case 'book_purchase':
      return DollarSign;
    case 'achievement_unlocked':
      return Trophy;
    case 'release_notes_update':
      return Rocket;
    case 'early_user_campaign':
      return Users;
    case 'new_book_submitted':
      return UserPlus;
    case 'new_story_published':
      return HelpCircle;
    case 'new_user_signup':
      return Flag;
    case 'user_login':
      return Bell;
    case 'content_flagged':
      return Flag;
    case 'support_request':
      return HelpCircle;
    case 'moderator_invitation':
      return HelpCircle;
    case 'book_pending_review':
      return HelpCircle;
    case 'book_approved':
      return HelpCircle;
    case 'book_rejected':
      return HelpCircle;
    default:
      return Bell;
  }
};

export const getNotificationColor = (notification: Notification): string => {
  switch (notification.type) {
    case 'new_story':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    case 'story_reaction':
      return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    case 'comment':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'book_purchase':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'achievement_unlocked':
      return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    case 'release_notes_update':
      return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
    case 'early_user_campaign':
      return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400';
    case 'new_book_submitted':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'new_story_published':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'new_user_signup':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'user_login':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'content_flagged':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'support_request':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'moderator_invitation':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'book_pending_review':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    case 'book_approved':
      return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    case 'book_rejected':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    default:
      return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
  }
};

export const shouldShowNotification = (notification: Notification): boolean => {
  // Don't show notifications that are older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const notificationDate = new Date(notification.created_at);
  return notificationDate > thirtyDaysAgo;
};

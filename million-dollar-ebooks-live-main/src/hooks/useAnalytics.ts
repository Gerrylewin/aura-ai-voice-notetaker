
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { usePostHog } from './usePostHog';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: any;
  user_id?: string;
  session_id?: string;
}

export function useAnalytics() {
  const { user } = useAuth();
  const posthog = usePostHog();

  const trackEvent = async (eventType: string, eventData?: any) => {
    try {
      // Track with PostHog
      posthog.trackEvent(eventType, eventData);

      // Track with Microsoft Clarity if available
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', eventType, eventData);
      }

      // Store analytics event in database
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          event_data: eventData || {},
          user_id: user?.id,
          session_id: sessionStorage.getItem('session_id') || 'anonymous'
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }

      console.log('Analytics Event:', {
        event_type: eventType,
        event_data: eventData,
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id') || 'anonymous',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page, timestamp: new Date().toISOString() });
  };

  const trackBookView = (bookId: string, title: string) => {
    trackEvent('book_view', { book_id: bookId, title, timestamp: new Date().toISOString() });
  };

  const trackBookPreview = (bookId: string, title: string) => {
    trackEvent('book_preview', { book_id: bookId, title, timestamp: new Date().toISOString() });
  };

  const trackBookPurchase = (bookId: string, title: string, price: number) => {
    trackEvent('book_purchase', { book_id: bookId, title, price, timestamp: new Date().toISOString() });
  };

  const trackSocialShare = (type: string, content: any) => {
    trackEvent('social_share', { share_type: type, content, timestamp: new Date().toISOString() });
  };

  const trackReadingProgress = (bookId: string, progress: number) => {
    trackEvent('reading_progress', { book_id: bookId, progress, timestamp: new Date().toISOString() });
  };

  const trackBookDownload = (bookId: string, title: string) => {
    trackEvent('book_download', { book_id: bookId, title, timestamp: new Date().toISOString() });
  };

  const trackChapterView = (bookId: string, chapterName: string, timeSpent?: number) => {
    trackEvent('chapter_view', { 
      book_id: bookId, 
      chapter_name: chapterName, 
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString() 
    });
  };

  const trackLinkClick = (bookId: string, linkType: string, linkUrl?: string) => {
    trackEvent('link_click', { 
      book_id: bookId, 
      link_type: linkType, 
      link_url: linkUrl,
      timestamp: new Date().toISOString() 
    });
  };

  const trackAnalyticsView = (bookId: string) => {
    trackEvent('analytics_view', { book_id: bookId, timestamp: new Date().toISOString() });
  };

  // Story analytics
  const trackStoryView = (storyId: string, title: string) => {
    trackEvent('story_view', { story_id: storyId, title, timestamp: new Date().toISOString() });
  };

  const trackStorySubmission = (storyId: string, title: string) => {
    trackEvent('story_submission', { story_id: storyId, title, timestamp: new Date().toISOString() });
  };

  const trackStoryReaction = (storyId: string, reactionType: string) => {
    trackEvent('story_reaction', { story_id: storyId, reaction_type: reactionType, timestamp: new Date().toISOString() });
  };

  const trackStoryComment = (storyId: string) => {
    trackEvent('story_comment', { story_id: storyId, timestamp: new Date().toISOString() });
  };

  return {
    trackEvent,
    trackPageView: (page: string) => {
      trackEvent('page_view', { page, timestamp: new Date().toISOString() });
      posthog.trackPageView(page);
    },
    trackBookView: (bookId: string, title: string) => {
      trackEvent('book_view', { book_id: bookId, title, timestamp: new Date().toISOString() });
      posthog.trackBookView(bookId, title);
    },
    trackBookPreview: (bookId: string, title: string) => {
      trackEvent('book_preview', { book_id: bookId, title, timestamp: new Date().toISOString() });
    },
    trackBookPurchase: (bookId: string, title: string, price: number) => {
      trackEvent('book_purchase', { book_id: bookId, title, price, timestamp: new Date().toISOString() });
      posthog.trackBookPurchase(bookId, title, price);
    },
    trackSocialShare: (type: string, content: any) => {
      trackEvent('social_share', { share_type: type, content, timestamp: new Date().toISOString() });
      posthog.trackSocialShare(type, content);
    },
    trackReadingProgress: (bookId: string, progress: number) => {
      trackEvent('reading_progress', { book_id: bookId, progress, timestamp: new Date().toISOString() });
      posthog.trackReadingProgress(bookId, progress);
    },
    trackBookDownload: (bookId: string, title: string) => {
      trackEvent('book_download', { book_id: bookId, title, timestamp: new Date().toISOString() });
    },
    trackChapterView: (bookId: string, chapterName: string, timeSpent?: number) => {
      trackEvent('chapter_view', { 
        book_id: bookId, 
        chapter_name: chapterName, 
        time_spent_seconds: timeSpent,
        timestamp: new Date().toISOString() 
      });
    },
    trackLinkClick: (bookId: string, linkType: string, linkUrl?: string) => {
      trackEvent('link_click', { 
        book_id: bookId, 
        link_type: linkType, 
        link_url: linkUrl,
        timestamp: new Date().toISOString() 
      });
    },
    trackAnalyticsView: (bookId: string) => {
      trackEvent('analytics_view', { book_id: bookId, timestamp: new Date().toISOString() });
    },
    trackStoryView: (storyId: string, title: string) => {
      trackEvent('story_view', { story_id: storyId, title, timestamp: new Date().toISOString() });
    },
    trackStorySubmission: (storyId: string, title: string) => {
      trackEvent('story_submission', { story_id: storyId, title, timestamp: new Date().toISOString() });
    },
    trackStoryReaction: (storyId: string, reactionType: string) => {
      trackEvent('story_reaction', { story_id: storyId, reaction_type: reactionType, timestamp: new Date().toISOString() });
    },
    trackStoryComment: (storyId: string) => {
      trackEvent('story_comment', { story_id: storyId, timestamp: new Date().toISOString() });
    },
  };
}

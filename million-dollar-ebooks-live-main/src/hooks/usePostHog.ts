
import { useEffect } from 'react';
import { useAuth } from './useAuth';

// PostHog configuration
const POSTHOG_API_KEY = 'phc_LQw1v56OY5DG9zDoNsKvnOu8MlIf99C5wJjQDG1fl2f';
const POSTHOG_HOST = 'https://app.posthog.com';

declare global {
  interface Window {
    posthog?: any;
  }
}

export function usePostHog() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize PostHog only if it hasn't been initialized yet
    if (typeof window !== 'undefined' && !window.posthog) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e)for(var i=0;i<e.length;i++){var r=e[i];null==t[r]||(t=t[r])}return t}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${POSTHOG_API_KEY}', {
          api_host: '${POSTHOG_HOST}',
          autocapture: true,
          capture_pageview: true,
          capture_pageleave: true,
          loaded: function(posthog) {
            window.__posthog_loaded = true;
          }
        });
      `;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Wait for PostHog to be loaded and identify user when authenticated
    const identifyUser = () => {
      if (window.posthog && typeof window.posthog.identify === 'function' && user) {
        window.posthog.identify(user.id, {
          email: user.email,
          user_id: user.id,
          account_type: user.user_metadata?.account_type || 'reader',
          created_at: user.created_at
        });
      }
    };

    if (user) {
      // Check if PostHog is already loaded
      if (window.posthog && typeof window.posthog.identify === 'function') {
        identifyUser();
      } else {
        // Wait for PostHog to load
        const checkPostHog = setInterval(() => {
          if (window.posthog && typeof window.posthog.identify === 'function') {
            identifyUser();
            clearInterval(checkPostHog);
          }
        }, 100);

        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkPostHog), 10000);
      }
    }
  }, [user]);

  const trackEvent = (eventName: string, properties?: any) => {
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id') || 'anonymous'
      });
    }
    console.log('PostHog Event:', eventName, properties);
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page });
  };

  const trackBookView = (bookId: string, title: string) => {
    trackEvent('book_view', { book_id: bookId, title });
  };

  const trackBookPurchase = (bookId: string, title: string, price: number) => {
    trackEvent('book_purchase', { book_id: bookId, title, price });
  };

  const trackUserSignup = (method: string) => {
    trackEvent('user_signup', { method });
  };

  const trackBookUpload = (bookId: string, title: string, genre: string) => {
    trackEvent('book_upload', { book_id: bookId, title, genre });
  };

  const trackReadingProgress = (bookId: string, progress: number) => {
    trackEvent('reading_progress', { book_id: bookId, progress });
  };

  const trackSocialShare = (type: string, content: any) => {
    trackEvent('social_share', { share_type: type, content });
  };

  return {
    trackEvent,
    trackPageView,
    trackBookView,
    trackBookPurchase,
    trackUserSignup,
    trackBookUpload,
    trackReadingProgress,
    trackSocialShare,
  };
}

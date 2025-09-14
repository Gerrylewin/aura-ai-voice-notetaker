
import { useState, useEffect, useCallback } from 'react';

export interface MobileUtils {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  scrollToTop: () => void;
  enableBodyScroll: () => void;
  disableBodyScroll: () => void;
}

export function useMobileUtils(): MobileUtils {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setIsMobile(width <= 768);
    setIsTablet(width > 768 && width <= 1024);
    setOrientation(width < height ? 'portrait' : 'landscape');
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const enableBodyScroll = useCallback(() => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
  }, []);

  const disableBodyScroll = useCallback(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.height = '100%';
    document.body.style.width = '100%';
  }, []);

  useEffect(() => {
    checkDevice();
    
    const handleResize = () => {
      checkDevice();
    };

    const handleOrientationChange = () => {
      setTimeout(checkDevice, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [checkDevice]);

  // Get safe area insets for mobile devices
  const safeAreaInsets = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  // Try to get CSS environment variables for safe areas
  if (typeof window !== 'undefined') {
    const computedStyle = getComputedStyle(document.documentElement);
    safeAreaInsets.top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0');
    safeAreaInsets.bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0');
    safeAreaInsets.left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0');
    safeAreaInsets.right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0');
  }

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    safeAreaInsets,
    scrollToTop,
    enableBodyScroll,
    disableBodyScroll
  };
}

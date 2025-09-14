
import { useCallback, useRef, useEffect } from 'react';

interface GestureState {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  isActive: boolean;
  timestamp: number;
}

interface UseGestureReaderOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTapLeft: () => void;
  onTapRight: () => void;
  onTapCenter: () => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  disabled?: boolean;
}

export function useGestureReader({
  onSwipeLeft,
  onSwipeRight,
  onTapLeft,
  onTapRight,
  onTapCenter,
  swipeThreshold = 50,
  velocityThreshold = 0.3,
  disabled = false
}: UseGestureReaderOptions) {
  const gestureState = useRef<GestureState>({
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isActive: false,
    timestamp: 0
  });

  // Check if the event target is an interactive UI element
  const isInteractiveElement = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;

    // Check if the target or any parent is an interactive element
    const interactiveSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a',
      '[role="button"]',
      '[data-interactive="true"]',
      '[class*="settings"]',
      '[class*="button"]',
      '[class*="control"]',
      '.absolute', // Settings panel and other overlays
    ];

    return interactiveSelectors.some(selector => {
      try {
        return target.closest(selector) !== null;
      } catch {
        return false;
      }
    });
  }, []);

  // Check if the event is in a restricted zone
  const isRestrictedZone = useCallback((element: Element, clientY: number): boolean => {
    const rect = element.getBoundingClientRect();
    const headerHeight = 80; // Approximate header height
    const footerHeight = 80; // Approximate footer height
    
    // Restrict gestures in header and footer areas
    return (
      clientY < rect.top + headerHeight ||
      clientY > rect.bottom - footerHeight
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const target = e.target;

    // Ignore if touching an interactive element
    if (isInteractiveElement(target)) {
      return;
    }

    // Ignore if in restricted zone
    if (e.currentTarget instanceof Element && isRestrictedZone(e.currentTarget, touch.clientY)) {
      return;
    }
    
    gestureState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isActive: true,
      timestamp: Date.now()
    };
  }, [disabled, isInteractiveElement, isRestrictedZone]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !gestureState.current.isActive || e.touches.length !== 1) return;
    
    // Check if we started on an interactive element (safety check)
    if (isInteractiveElement(e.target)) {
      gestureState.current.isActive = false;
      return;
    }
    
    const touch = e.touches[0];
    gestureState.current.deltaX = touch.clientX - gestureState.current.startX;
    gestureState.current.deltaY = touch.clientY - gestureState.current.startY;
    
    // Prevent page scrolling during horizontal gestures
    if (Math.abs(gestureState.current.deltaX) > Math.abs(gestureState.current.deltaY)) {
      e.preventDefault();
    }
  }, [disabled, isInteractiveElement]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !gestureState.current.isActive) return;
    
    // Final check for interactive elements
    if (isInteractiveElement(e.target)) {
      gestureState.current.isActive = false;
      return;
    }
    
    const { deltaX, deltaY, startX, timestamp } = gestureState.current;
    const duration = Date.now() - timestamp;
    const velocity = Math.abs(deltaX) / duration;
    const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);
    
    gestureState.current.isActive = false;
    
    // Handle swipe gestures
    if (isHorizontalGesture && (Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold)) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      return;
    }
    
    // Handle tap gestures (only if no significant movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const screenWidth = window.innerWidth;
      const leftZone = screenWidth * 0.3;
      const rightZone = screenWidth * 0.7;
      
      if (startX < leftZone) {
        onTapLeft();
      } else if (startX > rightZone) {
        onTapRight();
      } else {
        onTapCenter();
      }
    }
  }, [disabled, isInteractiveElement, onSwipeLeft, onSwipeRight, onTapLeft, onTapRight, onTapCenter, swipeThreshold, velocityThreshold]);

  const handlePointerStart = useCallback((e: PointerEvent) => {
    if (disabled || e.pointerType === 'touch') return; // Let touch events handle this
    
    // Check for interactive elements on pointer events too
    if (isInteractiveElement(e.target)) {
      return;
    }
    
    gestureState.current = {
      startX: e.clientX,
      startY: e.clientY,
      deltaX: 0,
      deltaY: 0,
      isActive: true,
      timestamp: Date.now()
    };
  }, [disabled, isInteractiveElement]);

  const handlePointerEnd = useCallback((e: PointerEvent) => {
    if (disabled || e.pointerType === 'touch' || !gestureState.current.isActive) return;
    
    if (isInteractiveElement(e.target)) {
      gestureState.current.isActive = false;
      return;
    }
    
    const { startX } = gestureState.current;
    gestureState.current.isActive = false;
    
    const screenWidth = window.innerWidth;
    const leftZone = screenWidth * 0.3;
    const rightZone = screenWidth * 0.7;
    
    if (startX < leftZone) {
      onTapLeft();
    } else if (startX > rightZone) {
      onTapRight();
    } else {
      onTapCenter();
    }
  }, [disabled, isInteractiveElement, onTapLeft, onTapRight, onTapCenter]);

  const attachGestureListeners = useCallback((element: HTMLElement) => {
    // Touch events for mobile
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Pointer events for desktop
    element.addEventListener('pointerdown', handlePointerStart);
    element.addEventListener('pointerup', handlePointerEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('pointerdown', handlePointerStart);
      element.removeEventListener('pointerup', handlePointerEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handlePointerStart, handlePointerEnd]);

  return { attachGestureListeners };
}

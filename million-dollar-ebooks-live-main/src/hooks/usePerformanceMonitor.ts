
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  renderTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(Date.now());
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = Date.now();
    const loadTime = mountTime.current - startTime.current;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${componentName} loaded in ${loadTime}ms`);
    }

    // Track render performance
    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Performance: ${componentName} render time ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  // Function to mark performance milestones
  const markMilestone = (milestone: string) => {
    if (process.env.NODE_ENV === 'development') {
      const currentTime = Date.now();
      const timeSinceMount = currentTime - mountTime.current;
      console.log(`📊 Performance: ${componentName} - ${milestone} at +${timeSinceMount}ms`);
    }
  };

  return { markMilestone };
}

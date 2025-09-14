import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  errorCount: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  sampleRate: number; // 0-1, percentage of sessions to monitor
  reportThreshold: number; // ms, only report if load time exceeds this
}

const defaultConfig: PerformanceConfig = {
  enableMonitoring: true,
  sampleRate: 0.1, // Monitor 10% of sessions
  reportThreshold: 1000 // Report if load time > 1s
};

export function usePerformanceMonitor(config: Partial<PerformanceConfig> = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorCount: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const finalConfig = { ...defaultConfig, ...config };

  // Check if this session should be monitored
  useEffect(() => {
    const shouldMonitor = finalConfig.enableMonitoring && 
                         Math.random() < finalConfig.sampleRate;
    setIsMonitoring(shouldMonitor);
  }, [finalConfig.enableMonitoring, finalConfig.sampleRate]);

  const measureLoadTime = useCallback((startTime: number) => {
    if (!isMonitoring) return;
    
    const loadTime = performance.now() - startTime;
    
    setMetrics(prev => ({
      ...prev,
      loadTime
    }));

    // Report if load time exceeds threshold
    if (loadTime > finalConfig.reportThreshold) {
      reportPerformanceIssue('slow_load', { loadTime });
    }
  }, [isMonitoring, finalConfig.reportThreshold]);

  const measureRenderTime = useCallback((componentName: string, renderFn: () => void) => {
    if (!isMonitoring) return renderFn();
    
    const startTime = performance.now();
    const result = renderFn();
    const renderTime = performance.now() - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.max(prev.renderTime, renderTime)
    }));

    // Report slow renders
    if (renderTime > 100) { // 100ms threshold for renders
      reportPerformanceIssue('slow_render', { 
        component: componentName, 
        renderTime 
      });
    }

    return result;
  }, [isMonitoring]);

  const measureMemoryUsage = useCallback(() => {
    if (!isMonitoring || !('memory' in performance)) return;
    
    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryUsage * 100 // Convert to percentage
      }));

      // Report high memory usage
      if (memoryUsage > 0.8) { // 80% threshold
        reportPerformanceIssue('high_memory', { memoryUsage });
      }
    }
  }, [isMonitoring]);

  const measureNetworkLatency = useCallback(async (url: string) => {
    if (!isMonitoring) return 0;
    
    const startTime = performance.now();
    
    try {
      await fetch(url, { method: 'HEAD' });
      const latency = performance.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: latency
      }));

      // Report high latency
      if (latency > 2000) { // 2s threshold
        reportPerformanceIssue('high_latency', { latency, url });
      }

      return latency;
    } catch (error) {
      reportPerformanceIssue('network_error', { error: error.message, url });
      return -1;
    }
  }, [isMonitoring]);

  const trackError = useCallback((error: Error, context?: string) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));

    reportPerformanceIssue('error', { 
      message: error.message, 
      stack: error.stack,
      context 
    });
  }, []);

  const reportPerformanceIssue = useCallback((type: string, data: any) => {
    if (!isMonitoring) return;

    const report = {
      type,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: { ...metrics }
    };

    // Send to analytics service (replace with your analytics endpoint)
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      }).catch(() => {
        // Silently fail if analytics endpoint is unavailable
      });
    } else {
      console.warn('Performance Issue:', report);
    }
  }, [isMonitoring, metrics]);

  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for slow load times
    if (metrics.loadTime > 3000) score -= 30;
    else if (metrics.loadTime > 1000) score -= 15;
    
    // Deduct points for slow renders
    if (metrics.renderTime > 500) score -= 20;
    else if (metrics.renderTime > 100) score -= 10;
    
    // Deduct points for high memory usage
    if (metrics.memoryUsage > 90) score -= 25;
    else if (metrics.memoryUsage > 70) score -= 10;
    
    // Deduct points for high network latency
    if (metrics.networkLatency > 5000) score -= 15;
    else if (metrics.networkLatency > 2000) score -= 5;
    
    // Deduct points for errors
    score -= metrics.errorCount * 5;
    
    return Math.max(0, score);
  }, [metrics]);

  const optimizePerformance = useCallback(() => {
    const optimizations: string[] = [];
    
    if (metrics.loadTime > 1000) {
      optimizations.push('Consider code splitting and lazy loading');
    }
    
    if (metrics.renderTime > 100) {
      optimizations.push('Optimize component rendering with React.memo or useMemo');
    }
    
    if (metrics.memoryUsage > 70) {
      optimizations.push('Check for memory leaks and optimize data structures');
    }
    
    if (metrics.networkLatency > 2000) {
      optimizations.push('Implement caching and optimize API calls');
    }
    
    if (metrics.errorCount > 0) {
      optimizations.push('Add error boundaries and improve error handling');
    }
    
    return optimizations;
  }, [metrics]);

  // Monitor memory usage periodically
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(measureMemoryUsage, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, measureMemoryUsage]);

  return {
    metrics,
    isMonitoring,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
    measureNetworkLatency,
    trackError,
    getPerformanceScore,
    optimizePerformance
  };
}

// Hook for measuring component performance
export function useComponentPerformance(componentName: string) {
  const { measureRenderTime, trackError } = usePerformanceMonitor();

  const measureRender = useCallback((renderFn: () => React.ReactNode) => {
    return measureRenderTime(componentName, renderFn);
  }, [componentName, measureRenderTime]);

  const trackComponentError = useCallback((error: Error) => {
    trackError(error, componentName);
  }, [componentName, trackError]);

  return {
    measureRender,
    trackComponentError
  };
}

// Hook for measuring API performance
export function useAPIPerformance() {
  const { measureNetworkLatency, trackError } = usePerformanceMonitor();

  const measureAPI = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Track successful API calls
      if (duration > 2000) {
        reportPerformanceIssue('slow_api', { 
          endpoint, 
          duration 
        });
      }
      
      return result;
    } catch (error) {
      trackError(error as Error, `API: ${endpoint}`);
      throw error;
    }
  }, [measureNetworkLatency, trackError]);

  return { measureAPI };
}

// Utility function for reporting performance issues
function reportPerformanceIssue(type: string, data: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    console.warn('Performance Issue:', { type, data });
  }
}
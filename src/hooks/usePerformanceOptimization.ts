"use client";

import { useEffect, useCallback, useRef } from "react";

// Hook for performance optimization
export function usePerformanceOptimization() {
  const rafId = useRef<number | null>(null);

  // Throttled function for expensive operations
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return function (...args: any[]) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // Debounced function for user input
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }, []);

  // Request animation frame wrapper
  const requestAnimationFrame = useCallback((callback: () => void) => {
    rafId.current = window.requestAnimationFrame(callback);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return null;
    }

    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
  }, []);

  // Memory usage optimization
  const optimizeMemory = useCallback(() => {
    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  }, []);

  return {
    throttle,
    debounce,
    requestAnimationFrame,
    prefersReducedMotion,
    createIntersectionObserver,
    optimizeMemory
  };
}

// Hook for virtual scrolling (for large lists)
export function useVirtualScrolling(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = useRef(0);
  const startIndex = Math.floor(scrollTop.current / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.current = target.scrollTop;
  }, []);

  return {
    startIndex,
    endIndex,
    handleScroll,
    totalHeight: itemCount * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

// Hook for haptic feedback
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate(50), [vibrate]);
  const mediumTap = useCallback(() => vibrate(100), [vibrate]);
  const heavyTap = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const success = useCallback(() => vibrate([50, 50, 50]), [vibrate]);
  const error = useCallback(() => vibrate([100, 100, 100]), [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error
  };
}
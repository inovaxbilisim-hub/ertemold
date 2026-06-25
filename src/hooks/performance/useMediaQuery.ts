"use client";

/**
 * useMediaQuery — Responsive breakpoint hook
 * 
 * CSS media query'lerini JavaScript'te takip eder.
 * Responsive component davranışları için kullanılır.
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * 
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 * ```
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Media query string'i takip eder
 * 
 * @param query - CSS media query string (örn: '(max-width: 768px)')
 * @param defaultValue - Server-side default değer (ssr için)
 * @returns Query eşleşiyor mu
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    // Check if window is available (SSR protection)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Breakpoint hook'ları — yaygın breakpoint'ler için
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

export function useIsLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * Device type hook'ları
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

/**
 * Reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/**
 * High contrast mode
 */
export function useHighContrastMode(): boolean {
  return useMediaQuery('(prefers-contrast: more)');
}

/**
 * Custom breakpoint observer
 */
export function useBreakpoint(
  breakpoints: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
): string {
  const [breakpoint, setBreakpoint] = useState<string>('base');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queries = Object.entries(breakpoints).map(([name, width]) => ({
      name,
      width,
      query: `(min-width: ${width}px)`,
      matches: window.matchMedia(`(min-width: ${width}px)`).matches,
    }));

    // Find largest matching breakpoint
    const matching = queries.filter(q => q.matches).sort((a, b) => b.width - a.width);
    
    if (matching.length > 0) {
      setBreakpoint(matching[0].name);
    } else {
      setBreakpoint('base');
    }

    // Listen for changes
    const handlers = queries.map(({ query }) => {
      const mq = window.matchMedia(query);
      const handler = () => {
        const current = queries.filter(q => window.matchMedia(q.query).matches).sort((a, b) => b.width - a.width);
        setBreakpoint(current.length > 0 ? current[0].name : 'base');
      };
      mq.addEventListener('change', handler);
      return { mq, handler };
    });

    return () => {
      handlers.forEach(({ mq, handler }) => mq.removeEventListener('change', handler));
    };
  }, [breakpoints]);

  return breakpoint;
}

/**
 * Orientation hook
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
}
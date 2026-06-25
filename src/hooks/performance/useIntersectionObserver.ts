"use client";

/**
 * useIntersectionObserver — Lazy loading ve scroll-triggered animasyonlar
 * 
 * Element'lerin viewport'a girip girmediğini takip eder.
 * Lazy loading, infinite scroll, animasyon tetikleme için kullanılır.
 * 
 * @example
 * ```tsx
 * const { ref, isVisible } = useIntersectionObserver({
 *   threshold: 0.1,
 *   triggerOnce: true,
 * });
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'fade-in' : 'opacity-0'}>
 *     Lazy content
 *   </div>
 * );
 * ```
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface IntersectionOptions {
  /** Viewport threshold (0-1) — default 0 */
  threshold?: number | number[];
  /** Root margin — default '0px' */
  rootMargin?: string;
  /** Sadece bir kez tetikle — default true */
  triggerOnce?: boolean;
  /** Root element — default viewport */
  root?: Element | null;
}

export interface UseIntersectionObserverReturn {
  /** Ref — element'e atanır */
  ref: (node: HTMLElement | null) => void;
  /** Element görünür mü */
  isVisible: boolean;
  /** Intersection ratio (0-1) */
  ratio: number;
  /** Entry data */
  entry: IntersectionObserverEntry | null;
}

/**
 * Intersection Observer hook
 */
export function useIntersectionObserver(
  options: IntersectionOptions = {}
): UseIntersectionObserverReturn {
  const { threshold = 0, rootMargin = '0px', triggerOnce = true, root = null } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [ratio, setRatio] = useState(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const hasTriggeredRef = useRef(false);

  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Already triggered and triggerOnce is true
    if (triggerOnce && hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setRatio(entry.intersectionRatio);

        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && triggerOnce) {
          hasTriggeredRef.current = true;
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, root]);

  return { ref, isVisible, ratio, entry };
}

/**
 * useScrollProgress — Scroll ilerlemesini takip eder
 * 
 * @example
 * ```tsx
 * const progress = useScrollProgress();
 * 
 * return <div style={{ width: `${progress * 100}%` }} />;
 * ```
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return progress;
}

/**
 * useElementInView — Belirli bir element viewport'ta mı
 */
export function useElementInView(
  elementRef: React.RefObject<HTMLElement | null>,
  options: IntersectionOptions = {}
): boolean {
  const { threshold = 0, rootMargin = '0px', triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, triggerOnce]);

  return isInView;
}
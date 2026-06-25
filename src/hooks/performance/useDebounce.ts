"use client";

/**
 * useDebounce — Input optimizasyonu için debounce hook
 * 
 * Rapid-fire input'ları (search, resize, scroll) debounce eder.
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API call with debounced value
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Value'yu debounce eder
 * 
 * @param value - Debounce edilecek değer
 * @param delay - Gecikme (ms) — default 500
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback — Debounced callback oluşturur
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query: string) => searchAPI(query),
 *   500
 * );
 * 
 * // Input onChange'te
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 500
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  }) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

/**
 * useDebouncedValue — Debounced string (search input için)
 */
export function useDebouncedSearch(
  value: string,
  delay = 500
): { debouncedValue: string; isTyping: boolean } {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTyping(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setDebouncedValue(value);
      setIsTyping(false);
    }, delay);

    setTimeoutId(newTimeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value, delay]);

  return { debouncedValue, isTyping };
}
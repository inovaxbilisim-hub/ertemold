'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

let batch: { path: string; ts: number }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (batch.length === 0) return;
  const payload = [...batch];
  batch = [];
  const body = JSON.stringify({ paths: payload.map(p => p.path) });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/track', blob);
    return;
  }

  fetch('/api/analytics/track', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => {});
}

function scheduleFlush() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 3000);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin') && pathname !== lastPath.current) {
      lastPath.current = pathname;
      batch.push({ path: pathname, ts: Date.now() });
      scheduleFlush();
    }
  }, [pathname]);

  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return null;
}

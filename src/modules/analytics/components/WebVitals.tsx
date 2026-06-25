'use client';

import { useReportWebVitals } from 'next/web-vitals';

// Batch vitals to reduce API calls
let vitalsBatch: Array<{ name: string; value: number; rating: string; delta: number }> = [];
let vitalsTimer: ReturnType<typeof setTimeout> | null = null;

function flushVitals() {
  if (vitalsBatch.length === 0) return;
  const payload = [...vitalsBatch];
  vitalsBatch = [];
  const body = JSON.stringify({ vitals: payload });

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

function scheduleVitalsFlush() {
  if (vitalsTimer) clearTimeout(vitalsTimer);
  // Flush after 5 seconds of inactivity or when 10 vitals collected
  vitalsTimer = setTimeout(flushVitals, 5000);
  if (vitalsBatch.length >= 10) {
    clearTimeout(vitalsTimer);
    flushVitals();
  }
}

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // Only track important metrics
    if (metric.name === 'CLS' || metric.name === 'LCP' || metric.name === 'INP') {
      vitalsBatch.push({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
      scheduleVitalsFlush();
    }
  });
  
  return null;
}

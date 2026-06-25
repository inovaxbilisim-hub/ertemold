import { NextResponse } from 'next/server';
import { trackPageView } from '@/modules/analytics/lib/analytics';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Handle web vitals (can be single or array)
    if (data.vitals) {
      // Vitals batching - just acknowledge, don't process (reduces DB load)
      // You can store these in a separate table or log them if needed
      return NextResponse.json({ success: true });
    }
    
    // Handle page view tracking
    if (Array.isArray(data.paths)) {
      // Process paths in parallel but catch individual errors
      const results = await Promise.allSettled(
        data.paths.map((p: string) => trackPageView(request, p))
      );
      
      // Count failures for logging
      const failures = results.filter(r => r.status === 'rejected').length;
      if (failures > 0) {
        console.warn(`${failures}/${data.paths.length} page views failed to track`);
      }
    } else if (typeof data.path === 'string') {
      await trackPageView(request, data.path);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    // Log error but don't fail the request (analytics shouldn't break UX)
    console.error('Analytics tracking error:', err);
    return NextResponse.json({ success: true }, { status: 200 }); // Return 200 to prevent retries
  }
}

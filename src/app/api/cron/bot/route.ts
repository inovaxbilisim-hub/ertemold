import { NextResponse } from 'next/server';
import { aiBotRunner } from '@/core/bot/AIBot';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel hobby plan max is usually 10s or 60s for pro, setting 60 just in case

export async function GET(request: Request) {
  try {
    // Vercel Cron Authentication
    // Vercel, CRON_SECRET çevre değişkeniyle eşleşen bir Authorization header gönderir
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Botu sadece 1 kere çalıştır
    await aiBotRunner.runOnce();

    return NextResponse.json({ success: true, message: 'AIBot başarıyla tetiklendi.', status: aiBotRunner.getStatus() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

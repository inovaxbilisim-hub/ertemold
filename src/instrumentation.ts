/**
 * Next.js Instrumentation Hook
 * Sunucu her ayağa kalktığında otomatik çağrılır.
 * AIBot'u burada başlatıyoruz — ayrı bir servis çalıştırmaya gerek yok.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { aiBotRunner } = await import('@/core/bot/AIBot');
    // aiBotRunner.init(); // Vercel ortamında Cron Job ile tetiklenmesi için kapatıldı
  }
}

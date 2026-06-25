/**
 * Public servis kategorileri endpoint'i.
 * Auth gerektirmez — Navbar ve ServicesSection gibi public bileşenler buraya bağlanır.
 * (Admin kategorileri düzenlemek için /api/admin/service-categories kullanın)
 */
import { NextResponse } from 'next/server';
import { getServiceCategories } from '@/lib/data';

export const revalidate = 604800; // 1 week

export async function GET() {
  try {
    const categories = await getServiceCategories();
    const active = categories.filter((c) => c.active);
    return NextResponse.json(active, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

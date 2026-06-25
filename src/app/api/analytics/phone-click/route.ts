import { NextResponse } from 'next/server';
import { trackPhoneClick } from '@/modules/analytics/lib/analytics';

interface PhoneClickRequestBody {
  phone?: string;
  path?: string;
  source?: string;
  branchId?: string;
  branchTitle?: string;
  cityName?: string;
  citySlug?: string;
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as PhoneClickRequestBody;
    const phone = String(data.phone || '').trim();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    await trackPhoneClick(request, {
      phone,
      path: typeof data.path === 'string' ? data.path : '/',
      source: typeof data.source === 'string' ? data.source : '',
      branchId: typeof data.branchId === 'string' ? data.branchId : '',
      branchTitle: typeof data.branchTitle === 'string' ? data.branchTitle : '',
      cityName: typeof data.cityName === 'string' ? data.cityName : '',
      citySlug: typeof data.citySlug === 'string' ? data.citySlug : '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Phone click tracking error:', error);
    return NextResponse.json({ error: 'Failed to track phone click' }, { status: 500 });
  }
}

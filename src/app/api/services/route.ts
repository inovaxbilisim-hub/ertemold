import { NextResponse } from 'next/server';
import { getServices } from '@/lib/data';

function methodNotAllowed() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function GET() {
  try {
    const services = await getServices();
    const activeServices = services
      .filter((item) => item.active)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        active: item.active,
        sort_order: item.sortOrder,
      }));

    return NextResponse.json(activeServices);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}

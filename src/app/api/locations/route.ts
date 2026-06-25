import { NextResponse } from 'next/server';
import { getBranches } from '@/lib/data';

function methodNotAllowed() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function GET() {
  try {
    const branches = await getBranches();
    const activeBranches = branches
      .filter((item) => item.active)
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json(activeBranches);
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

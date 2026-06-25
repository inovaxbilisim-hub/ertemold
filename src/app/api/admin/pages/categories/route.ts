import { dbAll, dbUpsert, dbDelete } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await dbAll<Record<string, unknown>>(
      'SELECT * FROM page_categories ORDER BY sort_order ASC'
    );
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { name, slug, icon, sort_order } = body;

    const payload = {
      id: body.id || crypto.randomUUID(),
      name,
      slug,
      icon: icon || '',
      sort_order: sort_order || 0,
    };

    await dbUpsert('page_categories', payload, 'id');
    
    return ok({ success: true, data: payload });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return badRequest('ID required');

  try {
    await dbDelete('page_categories', 'id', id);
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}

import { ok, badRequest, serverError, unauthorized } from '@/core/api/response';
import { dbGet } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';

export async function GET(request: Request) {
  const session = await verifySession();
  if (!session) return unauthorized();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const type = searchParams.get('type'); // sector, service, page

  if (!slug || !type) {
    return badRequest('Eksik parametre');
  }

  const tableMap: Record<string, string> = {
    service: 'services',
    page: 'pages',
    category: 'service_categories',
    reference: '"references"',
    location: 'locations'
  };

  const table = tableMap[type];
  if (!table) return badRequest('Geçersiz tip');

  try {
    // Note: for some tables we check 'id', for others 'slug'
    const column = type === 'page' ? 'slug' : 'id';
    const row = await dbGet(`SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`, [slug]);
    
    return ok({ exists: Boolean(row) });
  } catch (error) {
    return serverError(error);
  }
}

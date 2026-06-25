import { dbExec } from '@/core/database/db';
import { ok, serverError, unauthorized } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';

export async function POST() {
  const session = await verifySession();
  if (!session) return unauthorized();
  try {
    // Clear analytics tables
    await dbExec('DELETE FROM page_views');
    await dbExec('DELETE FROM phone_click_events');
    
    return ok({ success: true, message: 'Analytics data has been reset.' });
  } catch (error) {
    console.error('Failed to reset analytics:', error);
    return serverError('Failed to reset analytics data.');
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}

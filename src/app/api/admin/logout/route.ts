import { ok, unauthorized, serverError } from '@/core/api/response';
import { verifySession, deleteSession } from '@/core/auth/auth';

export async function POST() {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    return unauthorized('Not authenticated');
  }

  try {
    await deleteSession();
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

import { ok, unauthorized, serverError, methodNotAllowed } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';
import { verifyPassword, hashPassword } from '@/core/auth/password';
import { dbGet, dbRun } from '@/core/database/db';

export async function GET() {
  return methodNotAllowed();
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return ok({ success: false, error: 'Mevcut şifre ve yeni şifre gereklidir.' });
    }

    if (newPassword.length < 6) {
      return ok({ success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const user = await dbGet<{ username: string; password_hash: string }>(
      'SELECT username, password_hash FROM admin_users LIMIT 1'
    );

    if (!user) {
      return ok({ success: false, error: 'Kullanıcı bulunamadı.' });
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return ok({ success: false, error: 'Mevcut şifre yanlış.' });
    }

    const newHash = await hashPassword(newPassword);
    await dbRun('UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE username = ?', [newHash, user.username]);

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

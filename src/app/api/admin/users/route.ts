import { ok, unauthorized, serverError } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';
import { verifyPassword, hashPassword } from '@/core/auth/password';
import { dbAll, dbGet, dbRun } from '@/core/database/db';

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const users = await dbAll<{ id: number; username: string; created_at: string }>(
      'SELECT id, username, created_at FROM admin_users ORDER BY id ASC'
    );
    return ok(users);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return ok({ success: false, error: 'Kullanıcı adı ve şifre gereklidir.' });
    }

    if (password.length < 6) {
      return ok({ success: false, error: 'Şifre en az 6 karakter olmalıdır.' });
    }

    const existing = await dbGet<{ id: number }>('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existing) {
      return ok({ success: false, error: 'Bu kullanıcı adı zaten mevcut.' });
    }

    const passwordHash = await hashPassword(password);
    await dbRun('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { id } = await request.json();

    if (!id) {
      return ok({ success: false, error: 'Kullanıcı ID gereklidir.' });
    }

    // Son kullanıcının silinmesini engelle
    const count = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM admin_users');
    if (count && Number(count.count) <= 1) {
      return ok({ success: false, error: 'Son kullanıcı silinemez.' });
    }

    await dbRun('DELETE FROM admin_users WHERE id = ?', [id]);
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { id, currentPassword, newPassword } = await request.json();

    if (!id || !currentPassword || !newPassword) {
      return ok({ success: false, error: 'Kullanıcı ID, mevcut şifre ve yeni şifre gereklidir.' });
    }

    if (newPassword.length < 6) {
      return ok({ success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const user = await dbGet<{ password_hash: string }>('SELECT password_hash FROM admin_users WHERE id = ?', [id]);
    if (!user) {
      return ok({ success: false, error: 'Kullanıcı bulunamadı.' });
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return ok({ success: false, error: 'Mevcut şifre yanlış.' });
    }

    const newHash = await hashPassword(newPassword);
    await dbRun('UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, id]);

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const { id, username } = await request.json();

    if (!id || !username) {
      return ok({ success: false, error: 'Kullanıcı ID ve yeni kullanıcı adı gereklidir.' });
    }

    const existing = await dbGet<{ id: number }>('SELECT id FROM admin_users WHERE username = ? AND id != ?', [username, id]);
    if (existing) {
      return ok({ success: false, error: 'Bu kullanıcı adı zaten mevcut.' });
    }

    await dbRun('UPDATE admin_users SET username = ?, updated_at = NOW() WHERE id = ?', [username, id]);

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

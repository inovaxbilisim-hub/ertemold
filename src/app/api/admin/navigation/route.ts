/**
 * GET /api/admin/navigation
 * Admin sidebar navigasyonunu DB'den çeker.
 * Plugin sistemi ile öğe eklenip kaldırılabilir.
 */
import { dbAll } from "@/core/database/db";
import { verifySession } from "@/core/auth/auth";
import { ok, unauthorized, serverError } from "@/core/api/response";

export interface AdminNavItem {
  id: string;
  label: string;
  href?: string;
  badge?: string;
}

export interface AdminNavCategory {
  key: string;
  label: string;
  icon: string;
  description?: string;
  sort_order: number;
  items: AdminNavItem[];
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    // Kategoriler
    const categories = await dbAll<{
      key: string;
      label: string;
      icon: string;
      description: string | null;
      sort_order: number;
    }>(`
      SELECT key, label, icon, description, sort_order
      FROM admin_menu_categories
      WHERE active = true
      ORDER BY sort_order ASC
    `);

    // Öğeler (tek sorguda)
    const items = await dbAll<{
      category_key: string;
      item_id: string;
      label: string;
      href: string | null;
      badge: string | null;
      sort_order: number;
    }>(`
      SELECT category_key, item_id, label, href, badge, sort_order
      FROM admin_menu_items
      WHERE active = true
      ORDER BY category_key, sort_order ASC
    `);

    // Birleştir
    const result: AdminNavCategory[] = categories.map((cat) => ({
      key: cat.key,
      label: cat.label,
      icon: cat.icon,
      description: cat.description ?? undefined,
      sort_order: cat.sort_order,
      items: items
        .filter((item) => item.category_key === cat.key)
        .map((item) => ({
          id: item.item_id,
          label: item.label,
          href: item.href ?? undefined,
          badge: item.badge ?? undefined,
        })),
    }));

    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}

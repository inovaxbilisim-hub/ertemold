import { revalidatePath, revalidateTag } from 'next/cache';
import { dbAll, dbBatch } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { Service, Stat, LegalPage, SeoData } from '@/core/types';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function revalidateData(file: string) {
  const tagsMap: Record<string, string> = {
    seo: CACHE_TAGS.SEO,
    services: CACHE_TAGS.SERVICES,
    references: CACHE_TAGS.REFERENCES,
    'hero-intro': CACHE_TAGS.HERO,
    stats: CACHE_TAGS.STATS,
    legal: CACHE_TAGS.LEGAL,
    sections: 'section_content'
  };

  if (tagsMap[file]) {
    revalidateTag(tagsMap[file], 'default');
  }
  if (tagsMap[file] === CACHE_TAGS.SERVICES || tagsMap[file] === CACHE_TAGS.REFERENCES) {
    revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  }
  revalidatePath('/');
}

export async function GET(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  try {
    if (file === 'services') {
      const data = await dbAll<Record<string, unknown>>(
        'SELECT id, title, category_id, description, long_description, image_path, icon, icon_color, icon_bg_color, features, color, seo_title, seo_description, active, sort_order FROM services ORDER BY sort_order ASC'
      );
      const mapped: Service[] = data.map((s: any) => ({
        ...s,
        active: Boolean(s.active),
        sortOrder: s.sort_order || 0,
        longDescription: s.long_description,
        imagePath: s.image_path,
        iconColor: s.icon_color,
        iconBgColor: s.icon_bg_color,
        features: typeof s.features === 'string' ? JSON.parse(s.features) : (s.features || []),
        seoTitle: s.seo_title,
        seoDescription: s.seo_description,
      }));
      return ok(mapped);
    }

    // DEPRECATED: references → /api/admin/references kullanın
    if (file === 'references') {
      const refs = await import('@/domains/content/reference').then(m => m.getAllReferences());
      return ok(refs);
    }

    if (file === 'hero-intro') {
      const data = await dbAll<Record<string, unknown>>('SELECT * FROM hero_intro LIMIT 1');
      if (!data || data.length === 0) {
        return ok({
          active: true,
          left: { badge: '', title: '', description: '', ctaText: '', ctaLink: '', ctaSecondaryText: '', ctaSecondaryLink: '' },
          gallery: [],
        });
      }
      const row = data[0];
      return ok({
        ...row,
        id: row.id,
        active: Boolean(row.active ?? true),
        left: {
          badge: row.badge,
          title: row.title,
          description: row.description,
          ctaText: row.cta_text,
          ctaLink: row.cta_link,
          ctaSecondaryText: row.cta_secondary_text,
          ctaSecondaryLink: row.cta_secondary_link,
        },
        gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery) : (row.gallery || []),
      });
    }

    if (file === 'stats') {
      const data = await dbAll<Record<string, unknown>>(
        'SELECT * FROM stats ORDER BY sort_order ASC'
      );
      const mapped: Stat[] = data.map((s: any) => ({ ...s, order: s.sort_order }));
      return ok(mapped);
    }

    if (file === 'legal') {
      const data = await dbAll<Record<string, unknown>>('SELECT id, title, meta_title, meta_description, published, last_updated FROM legal_pages');
      const obj: Record<string, LegalPage> = {};
      data.forEach((l: any) => {
        obj[l.id] = {
          title: l.title,
          metaTitle: l.meta_title,
          metaDescription: l.meta_description,
          content: l.content,
          lastUpdated: String(l.last_updated ?? new Date().toISOString()),
          published: Boolean(l.published ?? true),
        };
      });
      return ok(obj);
    }

    if (file === 'seo') {
      const data = await dbAll<Record<string, unknown>>('SELECT * FROM seo');
      const obj: Record<string, SeoData> = {};
      data.forEach((s: any) => {
        obj[s.page_key] = {
          title: s.title,
          description: s.description,
          ogImage: s.og_image,
        };
      });
      return ok(obj);
    }

    if (file === 'sections') {
      const data = await dbAll<Record<string, unknown>>('SELECT * FROM section_content ORDER BY section_key ASC');
      const mapped = data.map((s: any) => ({
        sectionKey: s.section_key,
        badge: s.badge,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content
      }));
      return ok(mapped);
    }

    return badRequest('Invalid file');
  } catch (e: unknown) {
    return serverError(e);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { file, data } = await request.json();
  const now = new Date().toISOString();

  try {
    const statements: any[] = [];

    if (file === 'services') {
      const submittedIds = new Set((data as Service[]).map(s => String(s.id)));
      const existing = await dbAll<{ id: string | number }>('SELECT id FROM services');
      const existingIds = new Set(existing.map(e => String(e.id)));
      
      // Delete
      existing.filter(e => !submittedIds.has(String(e.id))).forEach(e => {
        statements.push({ sql: 'DELETE FROM services WHERE id = ?', args: [e.id] });
      });

      // Upsert
      (data as Service[]).forEach(s => {
        if (existingIds.has(String(s.id))) {
          statements.push({
            sql: `UPDATE services SET title=?, category_id=?, description=?, long_description=?, image_path=?, icon=?, icon_color=?, icon_bg_color=?, features=?, color=?, seo_title=?, seo_description=?, active=?, sort_order=? WHERE id=?`,
            args: [s.title, s.category_id ?? null, s.description, s.longDescription, s.imagePath, s.icon, s.iconColor, s.iconBgColor, JSON.stringify(s.features || []), s.color, s.seoTitle, s.seoDescription, Boolean(s.active), s.sortOrder || 0, s.id]
          });
        } else {
          statements.push({
            sql: `INSERT INTO services (id, title, category_id, description, long_description, image_path, icon, icon_color, icon_bg_color, features, color, seo_title, seo_description, active, sort_order)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [s.id, s.title, s.category_id ?? null, s.description, s.longDescription, s.imagePath, s.icon, s.iconColor, s.iconBgColor, JSON.stringify(s.features || []), s.color, s.seoTitle, s.seoDescription, Boolean(s.active), s.sortOrder || 0]
          });
        }
      });
    } 
    // DEPRECATED: references → /api/admin/references kullanın
    else if (file === 'references') {
      // no-op - backward compatibility only
    }
    else if (file === 'stats') {
      const submittedIds = new Set((data as Stat[]).map(s => s.id));
      const existing = await dbAll<{ id: string }>('SELECT id FROM stats');
      const existingIds = new Set(existing.map(e => String(e.id)));

      existing.filter(e => !submittedIds.has(e.id)).forEach(e => {
        statements.push({ sql: 'DELETE FROM stats WHERE id = ?', args: [e.id] });
      });

      (data as Stat[]).forEach(s => {
        if (existingIds.has(String(s.id))) {
          statements.push({
            sql: `UPDATE stats SET label=?, value=?, sort_order=? WHERE id=?`,
            args: [s.label, s.value, s.order ?? 0, s.id]
          });
        } else {
          statements.push({
            sql: `INSERT INTO stats (id, label, value, sort_order) VALUES (?, ?, ?, ?)`,
            args: [s.id, s.label, s.value, s.order ?? 0]
          });
        }
      });
    }
    else if (file === 'legal') {
      const existing = await dbAll<{ id: string }>('SELECT id FROM legal_pages');
      const existingIds = new Set(existing.map(e => String(e.id)));

      Object.entries(data as Record<string, LegalPage>).forEach(([key, val]) => {
        if (existingIds.has(key)) {
          statements.push({
            sql: `UPDATE legal_pages SET title=?, meta_title=?, meta_description=?, content=?, last_updated=?, published=? WHERE id=?`,
            args: [val.title, val.metaTitle, val.metaDescription, val.content, now, val.published ? 1 : 0, key]
          });
        } else {
          statements.push({
            sql: `INSERT INTO legal_pages (id, title, meta_title, meta_description, content, last_updated, published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [key, val.title, val.metaTitle, val.metaDescription, val.content, now, val.published ? 1 : 0]
          });
        }
      });
    }
    else if (file === 'seo') {
      const existing = await dbAll<{ page_key: string }>('SELECT page_key FROM seo');
      const existingIds = new Set(existing.map(e => String(e.page_key)));

      Object.entries(data as Record<string, SeoData>).forEach(([key, val]) => {
        if (existingIds.has(key)) {
          statements.push({
            sql: `UPDATE seo SET title=?, description=?, og_image=?, updated_at=? WHERE page_key=?`,
            args: [val.title, val.description, val.ogImage, now, key]
          });
        } else {
          statements.push({
            sql: `INSERT INTO seo (page_key, title, description, og_image, updated_at) VALUES (?, ?, ?, ?, ?)`,
            args: [key, val.title, val.description, val.ogImage, now]
          });
        }
      });
    }
    else if (file === 'hero-intro') {
      const existing = await dbAll<{ id: number }>('SELECT id FROM hero_intro');
      const existingIds = new Set(existing.map(e => String(e.id)));

      const h = data as any;
      const hId = String(h.id || 1);

      if (existingIds.has(hId)) {
        statements.push({
          sql: `UPDATE hero_intro SET active=?, badge=?, title=?, description=?, cta_text=?, cta_link=?, cta_secondary_text=?, cta_secondary_link=?, gallery=? WHERE id=?`,
          args: [Boolean(h.active), h.left?.badge, h.left?.title, h.left?.description, h.left?.ctaText, h.left?.ctaLink, h.left?.ctaSecondaryText, h.left?.ctaSecondaryLink, JSON.stringify(h.gallery || []), hId]
        });
      } else {
        statements.push({
          sql: `INSERT INTO hero_intro (id, active, badge, title, description, cta_text, cta_link, cta_secondary_text, cta_secondary_link, gallery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [hId, Boolean(h.active), h.left?.badge, h.left?.title, h.left?.description, h.left?.ctaText, h.left?.ctaLink, h.left?.ctaSecondaryText, h.left?.ctaSecondaryLink, JSON.stringify(h.gallery || [])]
        });
      }
    }

    else if (file === 'sections') {
      (data as any[]).forEach(s => {
        statements.push({
          sql: `UPDATE section_content SET badge = ?, title = ?, subtitle = ?, content = ? WHERE section_key = ?`,
          args: [s.badge, s.title, s.subtitle, s.content, s.sectionKey]
        });
      });
    }

    if (statements.length > 0) {
      await dbBatch(statements);
    }

    await revalidateData(file);

    return ok({ success: true });
  } catch (e: unknown) {
    return serverError(e);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}

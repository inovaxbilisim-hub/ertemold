import { dbGet, dbAll, dbUpsert, dbDelete, dbBatch } from '@/core/database/db';
import { revalidateTag, revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateSectors(slug?: string) {
  // @ts-ignore
  revalidateTag(CACHE_TAGS.SECTORS);
  // @ts-ignore
  revalidateTag(CACHE_TAGS.SITEMAP_DATA);
  revalidatePath('/sektorler');
  if (slug) {
    revalidatePath(`/sektorler/${slug}`);
  }
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const sectors = await dbAll('SELECT * FROM sectors ORDER BY sort_order ASC');
    const relations = await dbAll('SELECT sector_id, service_id FROM sector_services');
    
    const mapped = (sectors as any[]).map(s => {
      const serviceIds = relations.filter((r: any) => r.sector_id === s.id).map((r: any) => r.service_id);
      return {
        ...s,
        active: Boolean(s.active),
        recommended_service_ids: serviceIds
      };
    });
    return ok(mapped);
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { id, name, slug, description, image_path, active, sort_order, ui_metadata } = body;

    if (!name || !slug) {
      return badRequest('İsim ve slug zorunludur');
    }

    // Slug check for new items
    if (!id) {
      const existing = await dbGet('SELECT id FROM sectors WHERE slug = ?', [slug]);
      if (existing) {
        return badRequest('Bu slug zaten kullanılıyor');
      }
    }

    const isNew = !id;
    const upsertData: Record<string, any> = {
      name,
      slug,
      description: description || '',
      image_path,
      active: Boolean(active),
      sort_order: sort_order || 0,
      ui_metadata: ui_metadata || null
    };

    let responseId: string | number;

    if (isNew) {
      const newUuid = randomUUID();
      upsertData.legacy_id = newUuid;
      responseId = newUuid;
    } else {
      const numericId = Number(id);
      upsertData.id = numericId;
      responseId = numericId;
    }

    await dbUpsert('sectors', upsertData, 'id');

    let dbSectorId = id ? Number(id) : null;
    if (isNew) {
      const newlyInserted = await dbGet<{id: number}>('SELECT id FROM sectors WHERE legacy_id = ?', [responseId]);
      if (newlyInserted) dbSectorId = newlyInserted.id;
    }

    if (dbSectorId && Array.isArray(body.recommended_service_ids)) {
      await dbDelete('sector_services', 'sector_id', dbSectorId);
      if (body.recommended_service_ids.length > 0) {
        // Validate that all service IDs exist before inserting
        const validServices = await dbAll<{ id: number }>(
          `SELECT id FROM services WHERE id IN (${body.recommended_service_ids.map(() => '?').join(',')})`,
          body.recommended_service_ids.map((id: any) => Number(id))
        );
        const validServiceIds = new Set(validServices.map(s => s.id));
        
        // Filter only valid service IDs
        const validRecommendedIds = body.recommended_service_ids
          .map((id: any) => Number(id))
          .filter((id: number) => validServiceIds.has(id));
        
        if (validRecommendedIds.length > 0) {
          const batch = validRecommendedIds.map((svcId: number) => ({
            sql: 'INSERT INTO sector_services (sector_id, service_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
            args: [dbSectorId, svcId]
          }));
          await dbBatch(batch);
        }
      }
    }

    await revalidateSectors(slug);
    return ok({ success: true, id: responseId });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return badRequest('ID zorunludur');

  try {
    const numericId = /^\d+$/.test(id) ? Number(id) : id;
    await dbDelete('sectors', 'id', numericId);
    await revalidateSectors();
    return ok({ success: true });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function OPTIONS() {
  return ok({ ok: true });
}

import { revalidateTag, revalidatePath } from 'next/cache';
import { dbAll, dbBatch, dbDelete, dbGet } from '@/core/database/db';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError, methodNotAllowed } from '@/core/api/response';
import { CACHE_TAGS } from '@/core/cache/tags';

async function revalidateServices(params?: { slug?: string; categorySlug?: string; oldCategorySlug?: string }) {
  revalidateTag(CACHE_TAGS.SERVICES, 'default');
  revalidateTag(CACHE_TAGS.SITEMAP_DATA, 'default');
  revalidatePath('/hizmetler');

  if (params?.slug) {
    revalidatePath(`/hizmetler/${params.slug}`);
  }

  if (params?.categorySlug) {
    revalidatePath(`/hizmetler/${params.categorySlug}`);
  }

  if (params?.oldCategorySlug) {
    revalidatePath(`/hizmetler/${params.oldCategorySlug}`);
  }
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const data = await dbAll<Record<string, unknown>>('SELECT * FROM services ORDER BY sort_order ASC');

  const mapped = data.map((s) => ({
    ...s,
    longDescription: s.long_description,
    imagePath: s.image_path,
    iconColor: s.icon_color,
    iconBgColor: s.icon_bg_color,
    seoTitle: s.seo_title,
    seoDescription: s.seo_description,
    pseo_h2_template: s.pseo_h2_template,
    pseo_action_verb: s.pseo_action_verb,
    pseo_service_suffix: s.pseo_service_suffix,
    calculator_enabled: Boolean(s.calculator_enabled),
    calculator_price_per_sqm: s.calculator_price_per_sqm !== undefined ? Number(s.calculator_price_per_sqm) : null,
    calculator_description: s.calculator_description ?? null,
    calculator_button_text: s.calculator_button_text ?? null,
    calculator_disclaimer: s.calculator_disclaimer ?? null,
    serviceFaqs: s.service_faqs ? JSON.parse(String(s.service_faqs)) : [],
  }));

  return ok(mapped);
}

export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const data = await request.json();
    const items = Array.isArray(data) ? data : [data];

    console.log(`Processing ${items.length} service items in POST`);

    const categories = await dbAll<Record<string, unknown>>('SELECT id, slug FROM service_categories');
    const categoryMap = new Map(categories.map(c => [Number(c.id), String(c.slug)]));

    const affectedServiceSlugs = new Set<string>();
    const affectedCategorySlugs = new Set<string>();

    const serviceIds = items.map((s) => Number(s.id)).filter((id) => !isNaN(id) && id > 0);
    const oldServices = serviceIds.length > 0
      ? await dbAll<Record<string, unknown>>(`SELECT id, slug, category_id FROM services WHERE id IN (${serviceIds.join(',')})`)
      : [];

    const oldServicesMap = new Map(oldServices.map((s) => [Number(s.id), s]));
    const stmts: { sql: string; args: unknown[] }[] = [];

    for (let index = 0; index < items.length; index++) {
      const s = items[index] as Record<string, unknown>;
      const idAsNumber = s.id !== undefined && s.id !== null && s.id !== '' ? Number(s.id) : NaN;
      const isEdit = !isNaN(idAsNumber) && idAsNumber > 0;

      const catId = s.category_id !== undefined && s.category_id !== null && s.category_id !== ''
        ? Number(s.category_id)
        : null;
      const safeCatId = isNaN(catId as number) ? null : catId;

      const slug = s.slug || (isEdit ? String(idAsNumber) : String(s.title || ''));
      const serviceData: Record<string, unknown> = {
        slug,
        title: s.title,
        category_id: safeCatId,
        description: s.description || null,
        long_description: s.longDescription ?? null,
        image_path: s.imagePath ?? null,
        icon: s.icon ?? null,
        icon_color: s.iconColor ?? null,
        icon_bg_color: s.iconBgColor ?? null,
        features: JSON.stringify(s.features || []),
        color: s.color ?? null,
        seo_title: s.seoTitle ?? null,
        seo_description: s.seoDescription ?? null,
        pseo_h2_template: s.pseo_h2_template ?? null,
        pseo_action_verb: s.pseo_action_verb ?? null,
        pseo_service_suffix: s.pseo_service_suffix ?? null,
        calculator_enabled: Boolean(s.calculator_enabled),
        calculator_price_per_sqm: s.calculator_price_per_sqm ?? null,
        calculator_description: s.calculator_description ?? null,
        calculator_button_text: s.calculator_button_text ?? null,
        calculator_disclaimer: s.calculator_disclaimer ?? null,
        service_faqs: JSON.stringify(s.serviceFaqs || []),
      };

      const oldService = isEdit ? oldServicesMap.get(idAsNumber) : undefined;
      const oldSlug = oldService ? String(oldService.slug) : null;
      const oldCategoryId = oldService ? Number(oldService.category_id) : null;

      if (oldSlug) {
        affectedServiceSlugs.add(oldSlug);
      }
      if (slug) {
        affectedServiceSlugs.add(String(slug));
      }
      if (oldCategoryId && categoryMap.has(oldCategoryId)) {
        affectedCategorySlugs.add(categoryMap.get(oldCategoryId)!);
      }
      if (safeCatId && categoryMap.has(safeCatId)) {
        affectedCategorySlugs.add(categoryMap.get(safeCatId)!);
      }

      if (isEdit) {
        console.log(`[${index}] Updating service ID: ${idAsNumber}, Title: ${s.title}`);
        const cols = ['id', ...Object.keys(serviceData)];
        const vals = [idAsNumber, ...Object.values(serviceData)];
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = cols.map((c) => `"${c}"`).join(', ');
        const updateCols = cols.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');

        stmts.push({
          sql: `INSERT INTO services (${colNames}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateCols}`,
          args: vals,
        });
      } else {
        console.log(`[${index}] Inserting new service, Title: ${s.title}`);
        const cols = Object.keys(serviceData);
        const vals = Object.values(serviceData);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = cols.map((c) => `"${c}"`).join(', ');

        stmts.push({
          sql: `INSERT INTO services (${colNames}) VALUES (${placeholders})`,
          args: vals,
        });
      }
    }

    await dbBatch(stmts);
    console.log('Database update successful');

    try {
      for (const slug of affectedServiceSlugs) {
        await revalidateServices({ slug });
      }
      for (const catSlug of affectedCategorySlugs) {
        await revalidateServices({ categorySlug: catSlug });
      }
      if (affectedServiceSlugs.size === 0 && affectedCategorySlugs.size === 0) {
        await revalidateServices();
      }
    } catch (revalidateError) {
      console.error('Revalidation error in services API:', revalidateError);
    }

    return ok(null);
  } catch (error: unknown) {
    console.error('CRITICAL ERROR in services POST API:', error);
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return badRequest('Missing id');

  try {
    // Get service info before deletion for revalidation
    const service = await dbGet<Record<string, unknown>>('SELECT slug, category_id FROM services WHERE id = ?', [parseInt(id)]);
    
    if (service) {
      const category = service.category_id 
        ? await dbGet<Record<string, unknown>>('SELECT slug FROM service_categories WHERE id = ?', [Number(service.category_id)])
        : null;

      await dbDelete('services', 'id', parseInt(id));
      
      // Granular revalidation
      await revalidateServices({ 
        slug: String(service.slug), 
        categorySlug: category ? String(category.slug) : undefined 
      });
    } else {
      await dbDelete('services', 'id', parseInt(id));
      await revalidateServices();
    }

    return ok(null);
  } catch (error: unknown) {
    console.error('Error in services DELETE API:', error);
    return serverError(error);
  }
}


export async function PUT() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return ok({ ok: true });
}

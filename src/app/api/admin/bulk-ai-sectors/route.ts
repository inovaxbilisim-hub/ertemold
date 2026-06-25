import { ok, serverError, unauthorized } from '@/core/api/response';
import { verifySession } from '@/core/auth/auth';
import { dbAll, dbRun } from '@/core/database/db';
import { generateAiContent } from '@/modules/ai/lib/openrouter';
import { generateGeminiContent } from '@/modules/ai/lib/gemini';
import { getAIConfig } from '@/modules/settings/lib/data-settings';

export const dynamic = 'force-dynamic';

function buildPrompt(sectorName: string, companyName: string, promptTemplate?: string, jsonSchemaTemplate?: string, servicesListStr?: string) {
  const userPrompt = promptTemplate && promptTemplate.trim() !== '' 
    ? promptTemplate 
    : `Görevin: "{{companyName}}" firması için pSEO motorunda kullanılacak içerikleri üretmek. Sektör: "{{sectorName}}"`;

  const basePrompt = userPrompt
    .replace(/\{\{companyName\}\}/g, companyName)
    .replace(/\{\{sectorName\}\}/g, sectorName)
    .replace(/\{\{servicesList\}\}/g, servicesListStr || '');

  const userJsonSchema = jsonSchemaTemplate && jsonSchemaTemplate.trim() !== '' 
    ? jsonSchemaTemplate
        .replace(/\{\{companyName\}\}/g, companyName)
        .replace(/\{\{sectorName\}\}/g, sectorName)
        .replace(/\{\{servicesList\}\}/g, servicesListStr || '')
    : `{
  "description": "...",
  "recommended_service_ids": [1, 2]
}`;

  return `${basePrompt}

Lütfen sadece aşağıdaki yapıda geçerli bir JSON dön:
${userJsonSchema}

Not: JSON dışında hiçbir metin, markdown (json) bloğu veya açıklama yazma. Doğrudan JSON döndür.`;
}

// GET: List sectors missing descriptions (for admin UI)
export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const sectors = await dbAll<Record<string, any>>(
      `SELECT id, name, slug, description, ui_metadata, active FROM sectors ORDER BY sort_order ASC`
    );
    const mapped = sectors.map(s => ({
      id: String(s.id),
      name: String(s.name),
      slug: String(s.slug),
      active: Boolean(s.active),
      hasDescription: !!(s.description && String(s.description).trim().length > 0),
      hasFaq: (() => {
        try {
          const meta = s.ui_metadata ? JSON.parse(String(s.ui_metadata)) : {};
          return Array.isArray(meta.faqs) && meta.faqs.length > 0;
        } catch {
          return false;
        }
      })(),
    }));
    return ok({ sectors: mapped });
  } catch (error: unknown) {
    return serverError(error);
  }
}

// POST: Generate description for a SINGLE sector by id
export async function POST(request: Request) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { sectorId } = body;

    if (!sectorId) return ok({ error: 'sectorId is required' });

    const settings = await getAIConfig();
    const provider = settings?.ai_provider;
    if (!provider) return ok({ error: 'AI provider not configured' });

    const apiKey = provider === 'gemini' ? settings?.gemini_api_key : settings?.openrouter_api_key;
    if (!apiKey) return ok({ error: 'API key not set' });

    const sectors = await dbAll<Record<string, any>>(
      `SELECT id, name, ui_metadata FROM sectors WHERE id = $1`,
      [sectorId]
    );
    const sector = sectors[0];
    if (!sector) return ok({ error: 'Sector not found' });

    const companyName = settings.company_name || 'Ertem Epoksi';
    const providerModel = provider === 'gemini' ? (settings.gemini_ai_model || settings.ai_model) : (settings.openrouter_ai_model || settings.ai_model);
    const aiModel = (providerModel && providerModel !== 'openrouter/free' && String(providerModel).includes('/')) ? providerModel : '';
    const extraGeminiKeys = provider === 'gemini' ? (settings.gemini_api_keys || []).filter((k: string) => k && k !== apiKey) : [];
    const extraOpenRouterKeys = provider !== 'gemini' ? (settings.openrouter_api_keys || []).filter((k: string) => k && k !== apiKey) : [];
    
    const activeServices = await dbAll<Record<string, any>>(`SELECT id, title, slug FROM services WHERE active = true`);
    const servicesListStr = activeServices.map(s => `- ID: ${s.id} | Başlık: ${s.title}`).join('\n');

    const promptTemplate = settings.ai_prompt_sector_description || '';
    const jsonSchemaTemplate = settings.ai_prompt_sector_json || '';
    const prompt = buildPrompt(String(sector.name), companyName, promptTemplate, jsonSchemaTemplate, servicesListStr);

    let aiRes;
    if (provider === 'gemini') {
      aiRes = await generateGeminiContent(prompt, apiKey, aiModel, extraGeminiKeys);
    } else {
      aiRes = await generateAiContent(prompt, apiKey, aiModel, extraOpenRouterKeys);
    }

    let jsonStr = aiRes.content.trim().replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
    const firstOpen = jsonStr.indexOf('{');
    const lastClose = jsonStr.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
    }

    const parsed = JSON.parse(jsonStr);

    const currentUiMetadata = sector.ui_metadata ? JSON.parse(String(sector.ui_metadata)) : {};
    const { description, recommended_service_ids, ...otherParsedFields } = parsed;
    const newUiMetadata = {
      ...currentUiMetadata,
      ...otherParsedFields,
    };

    await dbRun('UPDATE sectors SET description = $1, ui_metadata = $2 WHERE id = $3', [
      description || '',
      JSON.stringify(newUiMetadata),
      sector.id,
    ]);

    if (Array.isArray(recommended_service_ids) && recommended_service_ids.length > 0) {
      await dbRun('DELETE FROM sector_services WHERE sector_id = $1', [sector.id]);
      
      // Validate that service IDs exist before inserting
      const serviceIds = recommended_service_ids.map(id => Number(id)).filter(id => !isNaN(id));
      if (serviceIds.length > 0) {
        const placeholders = serviceIds.map((_, i) => `$${i + 1}`).join(',');
        const validServices = await dbAll<{ id: number }>(
          `SELECT id FROM services WHERE id IN (${placeholders})`,
          serviceIds
        );
        const validServiceIds = new Set(validServices.map(s => s.id));
        
        for (const sId of serviceIds) {
          if (validServiceIds.has(sId)) {
            await dbRun('INSERT INTO sector_services (sector_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [sector.id, sId]);
          }
        }
      }
    }

    return ok({
      success: true,
      sectorId: String(sector.id),
      name: String(sector.name),
      description: parsed.description,
    });
  } catch (error: unknown) {
    return serverError(error);
  }
}

export async function OPTIONS() {
  return ok({ ok: true });
}

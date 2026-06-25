/**
 * City Case Study Generator
 *
 * Phase 3 - B3: Case Study Blocks
 *
 * Generates mini project stories (case studies) from real reference data.
 * Each story covers: Context → Challenge → Solution → Result
 *
 * Uses AI only to enrich narrative — the factual data always comes from DB.
 */

import 'server-only';
import { generateGeminiContent } from '@/modules/ai/lib/gemini';
import { getAIConfig } from '@/modules/settings/lib/data-settings';
import { dbAll, dbRun } from '@/core/database/db';

export interface CaseStudy {
  id: string;
  citySlug: string;
  cityName: string;
  serviceSlug: string;
  referenceId: number;
  referenceSlug: string;

  // Proje verileri (gerçek)
  projectTitle: string;
  sector: string | null;
  projectSize: number | null;
  projectDate: string | null;
  systemType: string | null;
  challenge: string | null;
  solution: string | null;

  // AI-zenginleştirilmiş anlatı
  storyTitle: string;    // çekici başlık
  storyContext: string;  // bağlam (neden bu proje?)
  storyChallenge: string; // teknik zorluk
  storySolution: string;  // uygulanan çözüm
  storyResult: string;    // sonuç ve fayda

  generatedAt: Date;
}

interface RawReference {
  id: number;
  slug: string;
  title: string;
  sector: string | null;
  short_description: string | null;
  project_size: number | null;
  project_date: string | null;
  system_type: string | null;
  application_type: string | null;
  challenge: string | null;
  solution: string | null;
  city_name: string | null;
  city_slug: string | null;
  service_slug: string | null;
  concrete_type: string | null;
  curing_time_hours: number | null;
  coating_thickness_mm: number | null;
}

/**
 * Fetch real references for a city (with enough data for a case study)
 */
async function fetchEligibleReferences(
  citySlug: string,
  serviceSlug?: string,
  limit = 3
): Promise<RawReference[]> {
  const serviceFilter = serviceSlug ? 'AND service_slug = $3' : '';
  const params: (string | number)[] = serviceSlug
    ? [citySlug, limit, serviceSlug]
    : [citySlug, limit];

  return dbAll<RawReference>(
    `SELECT id, slug, title, sector, short_description, project_size,
            project_date, system_type, application_type, challenge, solution,
            city_name, city_slug, service_slug, concrete_type,
            curing_time_hours, coating_thickness_mm
     FROM "references"
     WHERE city_slug = $1
       AND published = TRUE
       AND (challenge IS NOT NULL OR solution IS NOT NULL OR short_description IS NOT NULL)
       ${serviceFilter}
     ORDER BY featured DESC, project_size DESC NULLS LAST
     LIMIT $2`,
    params
  );
}

/**
 * Generate AI-enriched narrative for a single reference
 */
async function enrichWithAI(
  ref: RawReference,
  cityName: string,
  serviceTitle: string
): Promise<Pick<CaseStudy, 'storyTitle' | 'storyContext' | 'storyChallenge' | 'storySolution' | 'storyResult'> | null> {
  const aiConfig = await getAIConfig();
  const apiKey = aiConfig?.gemini_api_key || process.env.GEMINI_API_KEY;
  const extraKeys = aiConfig?.gemini_api_keys || [];

  if (!apiKey) return null;

  const projectInfo = [
    `Proje Adı: ${ref.title}`,
    ref.sector ? `Sektör: ${ref.sector}` : null,
    ref.project_size ? `Alan: ${ref.project_size} m²` : null,
    ref.system_type ? `Uygulanan Sistem: ${ref.system_type}` : null,
    ref.application_type ? `Uygulama Türü: ${ref.application_type}` : null,
    ref.concrete_type ? `Beton Tipi: ${ref.concrete_type}` : null,
    ref.coating_thickness_mm ? `Kaplama Kalınlığı: ${ref.coating_thickness_mm} mm` : null,
    ref.curing_time_hours ? `Kür Süresi: ${ref.curing_time_hours} saat` : null,
    ref.challenge ? `Zorluk: ${ref.challenge}` : null,
    ref.solution ? `Çözüm: ${ref.solution}` : null,
    ref.short_description ? `Özet: ${ref.short_description}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `Sen endüstriyel zemin kaplama uzmanısın. Aşağıdaki gerçek proje verilerini kullanarak kısa bir vaka çalışması (case study) hikayesi yaz.

PROJE VERİLERİ:
${projectInfo}
Şehir: ${cityName}
Hizmet: ${serviceTitle}

GÖREV:
Aşağıdaki JSON formatında bir vaka çalışması oluştur:

{
  "storyTitle": "Kısa, dikkat çekici başlık (maks 10 kelime, proje özelini vurgula)",
  "storyContext": "Projenin arka planı ve ihtiyaç (2 cümle, ${cityName} ve ${ref.sector || 'sektör'} belirt)",
  "storyChallenge": "Teknik zorluk ve gereksinimler (2-3 cümle, spesifik teknik detaylar)",
  "storySolution": "Uygulanan çözüm ve metodoloji (2-3 cümle, sistem ve teknik yaklaşım)",
  "storyResult": "Sonuç, fayda ve müşteri memnuniyeti (2 cümle, ölçülebilir sonuç)"
}

KURALLAR:
- Sadece verilen gerçek verileri kullan, uydurma
- Her alan 1-3 cümle olsun
- Türkçe yaz
- Profesyonel, teknik dil
- ${cityName} şehir adını bağlama göre en az bir kez kullan`;

  try {
    const result = await generateGeminiContent(prompt, apiKey, undefined, extraKeys);
    const text = result.content.trim();
    // JSON bloğunu çıkar
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return {
      storyTitle: String(parsed.storyTitle || ref.title),
      storyContext: String(parsed.storyContext || ''),
      storyChallenge: String(parsed.storyChallenge || ref.challenge || ''),
      storySolution: String(parsed.storySolution || ref.solution || ''),
      storyResult: String(parsed.storyResult || ''),
    };
  } catch (err) {
    console.error('[CASE-STUDY] AI enrichment failed:', err);
    return null;
  }
}

/**
 * Build a case study from a reference (with or without AI enrichment)
 */
function buildFallbackNarrative(ref: RawReference, cityName: string): Pick<CaseStudy, 'storyTitle' | 'storyContext' | 'storyChallenge' | 'storySolution' | 'storyResult'> {
  return {
    storyTitle: ref.title,
    storyContext: ref.short_description
      ? `${cityName}'da gerçekleştirilen bu projede ${ref.sector ? ref.sector + ' sektöründe' : ''} zemin kaplama ihtiyacı değerlendirildi. ${ref.short_description}`
      : `${cityName}'da ${ref.sector || ''} sektörü için ${ref.system_type || 'epoksi zemin'} uygulaması gerçekleştirildi.`,
    storyChallenge: ref.challenge || (ref.system_type ? `${ref.system_type} sistemi gerektiren özel zemin koşulları analiz edildi.` : ''),
    storySolution: ref.solution || (ref.system_type ? `${ref.system_type} uygulaması${ref.coating_thickness_mm ? ` ${ref.coating_thickness_mm} mm kalınlıkta` : ''} hayata geçirildi.` : ''),
    storyResult: ref.project_size
      ? `${ref.project_size.toLocaleString('tr-TR')} m² alan başarıyla tamamlandı${ref.curing_time_hours ? `, ${ref.curing_time_hours} saatte kür süreci tamamlandı` : ''}.`
      : 'Proje zamanında ve kalite standartlarında tamamlandı.',
  };
}

/**
 * Main: Generate case studies for a city+service combination
 */
export async function generateCityCaseStudies(
  citySlug: string,
  cityName: string,
  serviceSlug: string,
  serviceTitle: string,
  limit = 2
): Promise<CaseStudy[]> {
  console.log(`[CASE-STUDY] Generating for city: ${citySlug}, service: ${serviceSlug}`);

  const refs = await fetchEligibleReferences(citySlug, serviceSlug, limit);
  if (refs.length === 0) {
    console.log(`[CASE-STUDY] No eligible references for ${citySlug}/${serviceSlug}`);
    return [];
  }

  const caseStudies: CaseStudy[] = [];

  for (const ref of refs) {
    const aiNarrative = await enrichWithAI(ref, cityName, serviceTitle);
    const narrative = aiNarrative || buildFallbackNarrative(ref, cityName);

    caseStudies.push({
      id: `cs-${ref.id}`,
      citySlug,
      cityName,
      serviceSlug,
      referenceId: ref.id,
      referenceSlug: ref.slug,
      projectTitle: ref.title,
      sector: ref.sector,
      projectSize: ref.project_size,
      projectDate: ref.project_date,
      systemType: ref.system_type,
      challenge: ref.challenge,
      solution: ref.solution,
      ...narrative,
      generatedAt: new Date(),
    });

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  return caseStudies;
}

/**
 * Save case studies to DB
 */
export async function saveCaseStudies(caseStudies: CaseStudy[]): Promise<void> {
  for (const cs of caseStudies) {
    await dbRun(
      `INSERT INTO city_case_studies
         (city_slug, city_name, service_slug, reference_id, reference_slug,
          project_title, sector, project_size, project_date, system_type,
          story_title, story_context, story_challenge, story_solution, story_result)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (city_slug, service_slug, reference_id)
       DO UPDATE SET
         story_title = $11, story_context = $12, story_challenge = $13,
         story_solution = $14, story_result = $15, updated_at = CURRENT_TIMESTAMP`,
      [
        cs.citySlug, cs.cityName, cs.serviceSlug, cs.referenceId, cs.referenceSlug,
        cs.projectTitle, cs.sector, cs.projectSize, cs.projectDate, cs.systemType,
        cs.storyTitle, cs.storyContext, cs.storyChallenge, cs.storySolution, cs.storyResult,
      ]
    );
  }
}

/**
 * Load case studies from DB cache
 */
export async function getCityCaseStudies(
  citySlug: string,
  serviceSlug: string
): Promise<CaseStudy[]> {
  const rows = await dbAll<Record<string, unknown>>(
    `SELECT * FROM city_case_studies
     WHERE city_slug = $1 AND service_slug = $2 AND active = TRUE
     ORDER BY created_at DESC`,
    [citySlug, serviceSlug]
  );

  return rows.map(r => ({
    id: String(r.id),
    citySlug: String(r.city_slug),
    cityName: String(r.city_name),
    serviceSlug: String(r.service_slug),
    referenceId: Number(r.reference_id),
    referenceSlug: String(r.reference_slug),
    projectTitle: String(r.project_title),
    sector: r.sector ? String(r.sector) : null,
    projectSize: r.project_size ? Number(r.project_size) : null,
    projectDate: r.project_date ? String(r.project_date) : null,
    systemType: r.system_type ? String(r.system_type) : null,
    challenge: r.challenge ? String(r.challenge) : null,
    solution: r.solution ? String(r.solution) : null,
    storyTitle: String(r.story_title || r.project_title),
    storyContext: String(r.story_context || ''),
    storyChallenge: String(r.story_challenge || ''),
    storySolution: String(r.story_solution || ''),
    storyResult: String(r.story_result || ''),
    generatedAt: new Date(String(r.created_at)),
  }));
}

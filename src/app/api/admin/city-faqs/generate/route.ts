import { NextRequest } from 'next/server';
import { verifySession } from '@/core/auth/auth';
import { ok, unauthorized, badRequest, serverError } from '@/core/api/response';
import { getSettings } from '@/lib/data';
import { getCityStats } from '@/modules/content/lib/data-services';
import { PseoDataService } from '@/domains/pseo';
import { generateCityFAQs, type CityContext } from '@/modules/ai/lib/city-faq-generator';
import { dbRun } from '@/core/database/db';

export async function POST(request: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return unauthorized();

  try {
    const body = await request.json();
    const { citySlug, cityName, serviceSlug, serviceName, serviceDescription } = body;

    if (!citySlug || !cityName || !serviceSlug || !serviceName) {
      return badRequest('Missing required fields: citySlug, cityName, serviceSlug, serviceName');
    }

    console.log(`[City FAQ] Generating for ${cityName} - ${serviceName}`);

    // Fetch settings
    const settings = await getSettings();

    // Gather real data for this city
    const [cityStats, cityReferences, metadata] = await Promise.all([
      getCityStats(citySlug).catch(() => null),
      PseoDataService.getReferencesForCity(citySlug, 10).catch(() => []),
      PseoDataService.getLocationMetadata(citySlug).catch(() => null),
    ]);

    // Build context
    const context: CityContext = {
      cityName,
      citySlug,
      serviceName,
      serviceDescription,
      totalProjects: cityStats?.totalProjects || 0,
      totalSqm: cityStats?.totalSqm || 0,
      references: cityReferences.map((ref: any) => ({
        name: ref.name || ref.title,
        sector: ref.sector || '',
      })),
      climate: metadata ? {
        maxTempSummer: metadata.max_temp_summer_c,
        minTempWinter: metadata.min_temp_winter_c,
        humidityGroup: metadata.humidity_group,
      } : undefined,
      osb: metadata?.osb_list ? JSON.parse(metadata.osb_list) : undefined,
    };

    console.log(`[City FAQ] Context:`, { 
      projects: context.totalProjects, 
      references: context.references?.length,
      hasClimate: !!context.climate,
      hasOSB: !!context.osb,
    });

    // Generate FAQs
    const faqs = await generateCityFAQs(context, settings);

    console.log(`[City FAQ] Generated ${faqs.length} FAQs`);

    // Save to database
    for (const faq of faqs) {
      await dbRun(
        `INSERT INTO city_faqs (city_slug, service_slug, question, answer, category, active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (city_slug, service_slug, question) 
         DO UPDATE SET answer = $3, category = $4, updated_at = CURRENT_TIMESTAMP`,
        [citySlug, serviceSlug, faq.question, faq.answer, faq.category]
      );
    }

    console.log(`[City FAQ] ✅ Saved ${faqs.length} FAQs to database`);

    return ok({
      success: true,
      count: faqs.length,
      faqs: faqs,
    });

  } catch (error: any) {
    console.error('[City FAQ] Error:', error);
    return serverError(error.message || 'Failed to generate city FAQs');
  }
}

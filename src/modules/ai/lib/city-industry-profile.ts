/**
 * City Industry Profile Generator
 * 
 * Generates AI-powered industry analysis for each city based on:
 * - Real project data (references)
 * - OSB data
 * - Sector distribution
 * - Climate conditions
 * 
 * Part of PHASE 3: Content Differentiation & E-E-A-T Enhancement
 */

import 'server-only';
import { generateGeminiContent } from '@/modules/ai/lib/gemini';
import { getAIConfig } from '@/modules/settings/lib/data-settings';
import { dbAll, dbGet } from '@/core/database/db';

export interface CityIndustryProfile {
  citySlug: string;
  cityName: string;
  dominantSectors: Array<{
    name: string;
    percentage: number;
    projectCount: number;
  }>;
  typicalNeeds: string[];
  recommendedSystems: string[];
  localChallenges: string[];
  floorRequirements: {
    heavyTraffic: boolean;
    chemicalResistance: boolean;
    hygiene: boolean;
    dustControl: boolean;
  };
  analysisText: string; // AI-generated rich description
  generatedAt: Date;
}

interface CityAnalysisContext {
  cityName: string;
  citySlug: string;
  projectCount: number;
  totalSqm: number;
  sectorDistribution: Array<{ sector: string; count: number; percentage: number }>;
  systemTypes: Array<{ system: string; count: number }>;
  osbData?: {
    name: string;
    sectors: string[];
  };
  climateData?: {
    maxTemp: number;
    minTemp: number;
    humidity: string;
  };
}

/**
 * Gather real data about city's industrial profile
 */
async function gatherCityContext(citySlug: string): Promise<CityAnalysisContext | null> {
  // Get city info
  const city = await dbGet<{ name: string; slug: string }>(
    'SELECT name, slug FROM cities WHERE slug = $1 AND active = TRUE',
    [citySlug]
  );
  
  if (!city) return null;

  // Get project statistics
  const stats = await dbGet<{ total_projects: number; total_sqm: number }>(
    `SELECT 
      COUNT(*) as total_projects, 
      COALESCE(SUM(project_size), 0) as total_sqm
     FROM references 
     WHERE published = TRUE AND city_slug = $1`,
    [citySlug]
  );

  // Get sector distribution from references
  const sectorRows = await dbAll<{ sector: string; count: number }>(
    `SELECT sector, COUNT(*) as count
     FROM references
     WHERE published = TRUE AND city_slug = $1 AND sector IS NOT NULL AND sector != ''
     GROUP BY sector
     ORDER BY count DESC
     LIMIT 5`,
    [citySlug]
  );

  const totalProjects = Number(stats?.total_projects || 0);
  const sectorDistribution = sectorRows.map(row => ({
    sector: String(row.sector),
    count: Number(row.count),
    percentage: totalProjects > 0 ? Math.round((Number(row.count) / totalProjects) * 100) : 0
  }));

  // Get system types used
  const systemRows = await dbAll<{ system_type: string; count: number }>(
    `SELECT system_type, COUNT(*) as count
     FROM references
     WHERE published = TRUE AND city_slug = $1 AND system_type IS NOT NULL AND system_type != ''
     GROUP BY system_type
     ORDER BY count DESC
     LIMIT 5`,
    [citySlug]
  );

  const systemTypes = systemRows.map(row => ({
    system: String(row.system_type),
    count: Number(row.count)
  }));

  // Get OSB data if exists
  const osbRow = await dbGet<{ name: string; sectors: string }>(
    `SELECT name, sectors FROM osb_locations WHERE city_slug = $1`,
    [citySlug]
  );

  // Get climate data if exists
  const climateRow = await dbGet<{ max_temp_summer: number; min_temp_winter: number; humidity_level: string }>(
    `SELECT max_temp_summer, min_temp_winter, humidity_level FROM climate_data WHERE city_slug = $1`,
    [citySlug]
  );

  return {
    cityName: String(city.name),
    citySlug: citySlug,
    projectCount: totalProjects,
    totalSqm: Number(stats?.total_sqm || 0),
    sectorDistribution,
    systemTypes,
    osbData: osbRow ? {
      name: String(osbRow.name),
      sectors: osbRow.sectors ? JSON.parse(String(osbRow.sectors)) : []
    } : undefined,
    climateData: climateRow ? {
      maxTemp: Number(climateRow.max_temp_summer),
      minTemp: Number(climateRow.min_temp_winter),
      humidity: String(climateRow.humidity_level || 'normal')
    } : undefined
  };
}

/**
 * Generate AI analysis of city's industrial profile
 */
async function generateProfileAnalysis(context: CityAnalysisContext, serviceTitle: string): Promise<string> {
  const aiConfig = await getAIConfig();
  const apiKey = aiConfig?.gemini_api_key || process.env.GEMINI_API_KEY;
  const extraKeys = aiConfig?.gemini_api_keys || [];

  if (!apiKey) {
    console.warn('[CITY-PROFILE] No Gemini API key found in DB or ENV, skipping AI generation');
    return '';
  }

  const sectorList = context.sectorDistribution.map(s => `${s.sector} (%${s.percentage})`).join(', ');
  const systemList = context.systemTypes.map(s => s.system).join(', ');
  const osbInfo = context.osbData ? `Bölgede "${context.osbData.name}" OSB'si bulunmaktadır. Dominant sektörler: ${context.osbData.sectors.join(', ')}.` : '';
  const climateInfo = context.climateData
    ? `İklim koşulları: Yaz maksimum ${context.climateData.maxTemp}°C, kış minimum ${context.climateData.minTemp}°C, nem seviyesi ${context.climateData.humidity}.`
    : '';

  const prompt = `Sen endüstriyel zemin kaplama uzmanısın. ${context.cityName} şehrinde "${serviceTitle}" hizmeti için endüstriyel zemin profili analizi yap.

GERÇEK VERİLER:
- Toplam proje deneyimi: ${context.projectCount} proje, ${context.totalSqm} m²
- Sektör dağılımı: ${sectorList || 'Henüz proje verisi yok'}
- Kullanılan sistemler: ${systemList || 'Veri yok'}
${osbInfo}
${climateInfo}

GÖREV:
1. Bu şehrin endüstriyel zemin ihtiyaçlarını özetle (2-3 cümle)
2. Dominant sektörlere göre tipik zemin gereksinimlerini belirt
3. İklim koşullarının zemin seçimine etkisini açıkla
4. Bu bölge için önerilen epoksi sistemlerini listele

ÖNEMLİ:
- Sadece GERÇEK veriler kullan, uydurma
- Eğer proje verisi yoksa, OSB ve iklim verisinden yorum yap
- Profesyonel, teknik dil kullan
- 300-400 kelime arasında yaz
- HTML etiketleri kullanma, düz metin`;

  try {
    const result = await generateGeminiContent(prompt, apiKey, undefined, extraKeys);
    console.log(`[CITY-PROFILE] Generated profile for ${context.cityName}, length: ${result.content.length}`);
    return result.content.trim();
  } catch (error) {
    console.error('[CITY-PROFILE] AI generation error:', error);
    return '';
  }
}

/**
 * Determine floor requirements based on sector analysis
 */
function analyzeFloorRequirements(sectorDistribution: CityAnalysisContext['sectorDistribution']) {
  const sectors = sectorDistribution.map(s => s.sector.toLowerCase());
  
  const heavyTraffic = sectors.some(s => 
    s.includes('otomotiv') || 
    s.includes('lojistik') || 
    s.includes('depo')
  );

  const chemicalResistance = sectors.some(s => 
    s.includes('kimya') || 
    s.includes('otomotiv') || 
    s.includes('ilaç')
  );

  const hygiene = sectors.some(s => 
    s.includes('gıda') || 
    s.includes('ilaç') || 
    s.includes('sağlık')
  );

  const dustControl = sectors.some(s => 
    s.includes('tekstil') || 
    s.includes('elektronik') || 
    s.includes('gıda')
  );

  return {
    heavyTraffic,
    chemicalResistance,
    hygiene,
    dustControl
  };
}

/**
 * Recommend epoxy systems based on sector needs
 */
function recommendSystems(
  sectorDistribution: CityAnalysisContext['sectorDistribution'], 
  systemTypes: CityAnalysisContext['systemTypes']
): string[] {
  const recommendations: string[] = [];
  const sectors = sectorDistribution.map(s => s.sector.toLowerCase());
  const usedSystems = systemTypes.map(s => s.system);

  // Prioritize already-used systems (proven experience)
  if (usedSystems.length > 0) {
    recommendations.push(...usedSystems);
  }

  // Add recommendations based on sector analysis
  if (sectors.some(s => s.includes('otomotiv') || s.includes('lojistik'))) {
    if (!recommendations.includes('Multilayer Epoksi')) {
      recommendations.push('Multilayer Epoksi');
    }
  }

  if (sectors.some(s => s.includes('gıda') || s.includes('ilaç'))) {
    if (!recommendations.some(r => r.includes('Self-Leveling'))) {
      recommendations.push('Self-Leveling Epoksi');
    }
  }

  if (sectors.some(s => s.includes('tekstil') || s.includes('elektronik'))) {
    if (!recommendations.some(r => r.includes('Antistatic'))) {
      recommendations.push('Antistatic Epoksi');
    }
  }

  // Return top 3-4 recommendations
  return recommendations.slice(0, 4);
}

/**
 * Generate city challenges based on climate and sector
 */
function identifyLocalChallenges(context: CityAnalysisContext): string[] {
  const challenges: string[] = [];

  if (context.climateData) {
    if (context.climateData.maxTemp > 35) {
      challenges.push('Yüksek sıcaklıkta hızlı kür yönetimi');
    }
    if (context.climateData.minTemp < -5) {
      challenges.push('Düşük sıcaklıkta uygulama zorlukları');
    }
    if (context.climateData.humidity === 'high') {
      challenges.push('Yüksek nem nedeniyle su bazlı sistem tercihi');
    }
    if (context.climateData.humidity === 'low') {
      challenges.push('Düşük nemde hızlı kuruma kontrolü');
    }
  }

  // Sector-specific challenges
  const hasFoodSector = context.sectorDistribution.some(s => 
    s.sector.toLowerCase().includes('gıda')
  );
  if (hasFoodSector) {
    challenges.push('Gıda sektörü hijyen standartları');
  }

  const hasAutomotive = context.sectorDistribution.some(s => 
    s.sector.toLowerCase().includes('otomotiv')
  );
  if (hasAutomotive) {
    challenges.push('Ağır forklift trafiği ve kimyasal dayanım');
  }

  return challenges.slice(0, 4);
}

/**
 * Main function: Generate complete city industry profile
 */
export async function generateCityIndustryProfile(
  citySlug: string, 
  serviceTitle: string
): Promise<CityIndustryProfile | null> {
  console.log(`[CITY-PROFILE] Generating profile for city: ${citySlug}, service: ${serviceTitle}`);

  const context = await gatherCityContext(citySlug);
  
  if (!context) {
    console.warn(`[CITY-PROFILE] City not found: ${citySlug}`);
    return null;
  }

  // Don't generate profile if no data exists
  if (context.projectCount === 0 && !context.osbData) {
    console.log(`[CITY-PROFILE] No data available for ${citySlug}, skipping profile`);
    return null;
  }

  const floorRequirements = analyzeFloorRequirements(context.sectorDistribution);
  const recommendedSystems = recommendSystems(context.sectorDistribution, context.systemTypes);
  const localChallenges = identifyLocalChallenges(context);

  // Generate AI analysis
  const analysisText = await generateProfileAnalysis(context, serviceTitle);

  // Extract typical needs from sector analysis
  const typicalNeeds: string[] = [];
  if (floorRequirements.heavyTraffic) typicalNeeds.push('Yüksek trafik dayanımı');
  if (floorRequirements.chemicalResistance) typicalNeeds.push('Kimyasal direnç');
  if (floorRequirements.hygiene) typicalNeeds.push('Hijyenik yüzey');
  if (floorRequirements.dustControl) typicalNeeds.push('Toz kontrolü');

  return {
    citySlug: context.citySlug,
    cityName: context.cityName,
    dominantSectors: context.sectorDistribution.slice(0, 3).map(s => ({
      name: s.sector,
      percentage: s.percentage,
      projectCount: s.count,
    })),
    typicalNeeds,
    recommendedSystems,
    localChallenges,
    floorRequirements,
    analysisText,
    generatedAt: new Date()
  };
}

/**
 * Format profile as readable table/section for display
 */
function formatProfileAsTable(profile: CityIndustryProfile): string {
  const sectors = profile.dominantSectors
    .map(s => `${s.name} (%${s.percentage})`)
    .join(', ') || 'Veri yok';

  const needs = profile.typicalNeeds.join(', ') || 'Analiz ediliyor';
  const systems = profile.recommendedSystems.join(', ') || 'Öneri hazırlanıyor';
  const challenges = profile.localChallenges.join(', ') || '-';

  return `
**${profile.cityName} Endüstriyel Zemin Profili**

**Dominant Sektörler:** ${sectors}

**Tipik Zemin İhtiyaçları:** ${needs}

**Önerilen Sistemler:** ${systems}

**Yerel Zorluklar:** ${challenges}
  `.trim();
}

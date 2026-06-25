import { getHeroIntro, getReferences, getServices, getStats, getSectionContent, getBranches, getServiceCategories, getSettings, getAllPages, getFaqs, getSectors } from '@/lib/data';

export interface DynamicPageData {
  page: any | null;
  servicesData: any[];
  referencesData: any[];
  statsData: any[];
  heroData: any;
  sectionContentData: any;
  branchesData: any[];
  categoriesData: any[];
  allPages: any[];
  faqs: any[];
  sectorsData: any[];
  settingsData: any;
}

export async function fetchDynamicPageData(_path: string, page: any): Promise<DynamicPageData> {
  const contentData = typeof page.content_data === 'string'
    ? JSON.parse(page.content_data)
    : (page.content_data || {});

  const needsAll = ['about', 'service'].includes(page.template_name as string);
  const needsRefs = needsAll || page.template_name === 'references';
  const needsBranches = needsAll || page.template_name === 'contact';

  const [
    servicesData,
    referencesData,
    statsData,
    heroData,
    sectionContentData,
    branchesData,
    categoriesData,
    allPages,
    faqs,
    sectorsData,
  ] = await Promise.all([
    getServices(),
    needsRefs ? getReferences() : Promise.resolve([]),
    needsAll ? getStats() : Promise.resolve([]),
    needsAll ? getHeroIntro() : Promise.resolve(null),
    getSectionContent(),
    needsBranches ? getBranches() : Promise.resolve([]),
    getServiceCategories(),
    getAllPages(),
    getFaqs(),
    ['service', 'sektorler_index', 'sektorler_detail'].includes(page.template_name as string)
      ? getSectors()
      : Promise.resolve([]),
  ]);

  const settingsData = await getSettings().catch(() => null);

  return {
    page: { ...page, contentData },
    servicesData,
    referencesData,
    statsData,
    heroData,
    sectionContentData,
    branchesData,
    categoriesData,
    allPages,
    faqs,
    sectorsData,
    settingsData,
  };
}

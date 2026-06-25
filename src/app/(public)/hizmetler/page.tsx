import { getServices, getServiceCategories, getSectionContent, getSettings } from '@/lib/data';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import { MetaGenerator } from '@/domains/seo-engine';
import { Metadata } from 'next';
import { replacePlaceholders } from '@/modules/settings/lib/ui-content';

export const revalidate = 604800; // 1 week cache

export async function generateMetadata(): Promise<Metadata> {
  return MetaGenerator.generate({ pageKey: 'hizmetler' });
}

export default async function ServicesPage() {
  const [services, categories, sectionContent, settings] = await Promise.all([
    getServices(),
    getServiceCategories(),
    getSectionContent(),
    getSettings()
  ]);

  const sector = settings?.sector || 'Kurumsal';
  const values = { sector, companyName: settings?.companyName || '' };
  
  const servicesSectionContent = replacePlaceholders(sectionContent['services'], values);

  return (
    <main className="pt-20">
      <ServicesSection 
        services={services} 
        variant="full" 
        initialCategories={categories}
        sectionContent={servicesSectionContent}
      />
    </main>
  );
}

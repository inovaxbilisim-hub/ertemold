import { getReferences, getSectionContent, getSettings } from '@/lib/data';
import ReferencesSection from '@/modules/content/sections/ReferencesSection';
import { MetaGenerator, SchemaGenerator } from '@/domains/seo-engine';
import StructuredData from '@/modules/seo/components/StructuredData';
import { Metadata } from 'next';
import { replacePlaceholders } from '@/modules/settings/lib/ui-content';

export const revalidate = 604800; // 1 week cache

export async function generateMetadata(): Promise<Metadata> {
  return MetaGenerator.generate({ pageKey: 'referanslar' });
}

export default async function ReferencesPage() {
  const [references, sectionContent, settings] = await Promise.all([
    getReferences(),
    getSectionContent(),
    getSettings(),
  ]);

  const sector = settings?.sector || 'Kurumsal';
  const values = { sector, companyName: settings?.companyName || '' };
  const referencesSectionContent = replacePlaceholders(sectionContent['references'], values);

  const schema = await SchemaGenerator.buildReferencesSchema({
    references,
    settings,
    pageUrl: '/referanslar',
  });

  return (
    <main className="pt-20">
      <StructuredData id="references-schema" data={schema} />
      <ReferencesSection 
        data={references} 
        variant="grid" 
        sectionContent={referencesSectionContent}
      />
    </main>
  );
}

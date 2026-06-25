import * as LucideIcons from 'lucide-react';
import CategoryLanding from '@/modules/content/templates/CategoryLanding';
import ContactSection from '@/modules/content/sections/ContactSection';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import StructuredData from '@/modules/seo/components/StructuredData';
import { SchemaGenerator } from '@/domains/seo-engine';
import { getServices, getSettings, getServiceCategories, getReferences } from '@/lib/data';
import type { Reference } from '@/core/types';

export default async function CategoryLandingPage({ categorySlug }: { categorySlug: string }) {
  const [servicesData, settings, allCategories, referencesData] = await Promise.all([
    getServices(),
    getSettings().catch(() => null),
    getServiceCategories(),
    getReferences().catch(() => []),
  ]);

  const category = allCategories.find((c: any) => c.slug === categorySlug && c.active);
  if (!category) return null;

  const specializedUi = settings?.uiContent.categoryPages?.[category.slug];
  const categoryServices = servicesData.filter((service: any) => service.category_id === category.id);
  const categoryReferences = referencesData.filter((reference: Reference) => {
    const sectorValue = String(reference.sector || '').toLowerCase().trim();
    const categoryName = String(category.name || '').toLowerCase().trim();
    if (!sectorValue) return false;
    return sectorValue === categoryName
      || sectorValue.replace(/\s+/g, '-') === category.slug
      || sectorValue.includes(categoryName)
      || categoryName.includes(sectorValue);
  });
  const displayedReferences = categoryReferences.length > 0 ? categoryReferences.slice(0, 8) : referencesData.slice(0, 6);

  const collectionSchema = await SchemaGenerator.buildCategoryCollectionSchema({
    name: specializedUi ? `${specializedUi.titlePrefix || ''} ${specializedUi.titleAccent || ''}`.trim() : category.name,
    description: specializedUi?.description || category.description,
    canonicalPath: `/${category.slug}`,
    settings,
    services: categoryServices,
  });

  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Shield;

  return (
    <>
      <StructuredData id={`${categorySlug}-category-schema`} data={collectionSchema} />
      <CategoryLanding
        backLabel={specializedUi?.backLabel || 'Hizmetler'}
        badge={specializedUi?.badge || 'Kurumsal'}
        titlePrefix={specializedUi?.titlePrefix || category.name}
        titleAccent={specializedUi?.titleAccent || ''}
        titleSuffix={specializedUi?.titleSuffix || ''}
        description={specializedUi?.description || category.description}
        icon={IconComponent}
        iconClassName="text-[var(--accent-teal)]"
        headerClassName="category-header-bg"
        badgeClassName="category-badge"
        accentClassName="gradient-text"
      />

      {(specializedUi?.overviewTitle || specializedUi?.overviewText) && (
        <section className="py-20 px-6 bg-white">
          <div className="container-boxed max-w-5xl mx-auto text-center">
            {specializedUi?.overviewTitle && (
              <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-4">{specializedUi.overviewTitle}</p>
            )}
            {specializedUi?.overviewText && (
              <p className="text-lg leading-8 text-slate-600">{specializedUi.overviewText}</p>
            )}
          </div>
        </section>
      )}

      {(specializedUi?.serviceScopeTitle || specializedUi?.serviceScopeText) && (
        <section className="py-20 px-6 bg-slate-50">
          <div className="container-boxed max-w-5xl mx-auto text-center">
            {specializedUi?.serviceScopeTitle && (
              <h2 className="text-3xl font-black tracking-tight text-black mb-6">{specializedUi.serviceScopeTitle}</h2>
            )}
            {specializedUi?.serviceScopeText && (
              <p className="text-base text-slate-600 leading-relaxed">{specializedUi.serviceScopeText}</p>
            )}
          </div>
        </section>
      )}

      <ServicesSection
        services={servicesData}
        variant="full"
        category={categorySlug}
        initialCategories={allCategories}
      />

      {displayedReferences.length > 0 && (
        <section className="py-20 px-6 bg-[#f9fbff]">
          <div className="container-boxed max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-3">
                {specializedUi?.referenceSectionTitle || 'Sektörel Referanslar'}
              </p>
              {specializedUi?.referenceSectionSubtitle ? (
                <p className="text-base text-slate-600 leading-relaxed">{specializedUi.referenceSectionSubtitle}</p>
              ) : (
                <p className="text-base text-slate-600 leading-relaxed">Gerçek proje örneklerimiz ve saha uygulamalarımızla hizmet kalitemizi ortaya koyuyoruz.</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedReferences.map((reference: any) => (
                <div key={reference.id || reference.name} className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-black mb-3">{reference.name}</h3>
                    {reference.sector && <p className="text-sm uppercase tracking-[0.2em] text-blue-600 mb-2">{reference.sector}</p>}
                    <p className="text-sm text-slate-600">{reference.projectSummary}</p>
                  </div>
                  <div className="mt-auto">
                    <a href={`/referanslar/${reference.slug ?? ''}`} className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-sm">Detayları Gör</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(specializedUi?.ctaBottomTitle || specializedUi?.ctaBottomSubtitle || specializedUi?.ctaBottomButtonText) && (
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-teal text-white">
          <div className="container-boxed max-w-5xl mx-auto text-center">
            {specializedUi?.ctaBottomTitle && <h2 className="text-4xl font-black tracking-tight mb-6">{specializedUi.ctaBottomTitle}</h2>}
            {specializedUi?.ctaBottomSubtitle && <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-8">{specializedUi.ctaBottomSubtitle}</p>}
            {specializedUi?.ctaBottomButtonText && (
              <a href={specializedUi.ctaBottomButtonLink || '/iletisim'} className="inline-flex items-center justify-center rounded-full bg-white text-black px-12 py-4 font-black uppercase tracking-[0.2em] shadow-lg">
                {specializedUi.ctaBottomButtonText}
              </a>
            )}
          </div>
        </section>
      )}

      <ContactSection />
    </>
  );
}

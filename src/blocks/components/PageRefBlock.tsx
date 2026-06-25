'use client';
import BlockRenderer from '@/blocks/renderer';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import AboutSection from '@/modules/content/sections/AboutSection';
import ReferencesSection from '@/modules/content/sections/ReferencesSection';
import ContactSection from '@/modules/content/sections/ContactSection';
import MasonryHero from '@/modules/content/sections/MasonryHero';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';
import type { BlockComponentProps } from '@/blocks/types';

export default function PageRefBlock({ block, index, servicesData, referencesData, statsData, heroData, sectionContentData, branchesData, categoriesData, allPagesData, depth = 0, renderedPageIds = [], settings }: BlockComponentProps) {
  const blockKey = `page-ref-${index}`;
  if (!block.data.pageId || !allPagesData) return null;

  const isSelfReference = renderedPageIds.includes(String(block.data.pageId));
  const targetPage = allPagesData.find((p: Record<string, any>) => String(p.id) === String(block.data.pageId));
  if (!targetPage) return null;

  const pageContent = typeof targetPage.content_data === 'string'
    ? JSON.parse(targetPage.content_data)
    : (targetPage.content_data || {});

  const targetBlocks = pageContent.blocks || [];

  const renderTemplatePart = () => {
    switch (targetPage.template_name) {
      case 'service':
        return (
          <>
            <div className="-mx-4 md:-mx-6">
              <ServicesSection
                variant="full"
                services={servicesData as any}
                sectionContent={sectionContentData?.services || sectionContentData?.guvenlik}
                badge={pageContent.badge}
                title={pageContent.title}
                subtitle={pageContent.subtitle}
                initialCategories={categoriesData}
              />
            </div>
            {pageContent.body && (
              <div className="py-20 px-4 md:px-0">
                <div className="max-w-[1240px] mx-auto">
                  <div
                    className="prose prose-slate prose-lg max-w-none prose-headings:text-black prose-headings:font-black prose-headings:italic prose-headings:tracking-tight prose-p:text-black/70 prose-p:font-medium prose-p:leading-relaxed prose-li:text-black/70 prose-li:font-medium prose-strong:text-black prose-strong:font-bold"
                    dangerouslySetInnerHTML={{ __html: AiOverviewsHelper.injectAiFriendlyMarkers(pageContent.body || '') }}
                  />
                </div>
              </div>
            )}
          </>
        );
      case 'about':
        return (
          <div className="-mx-4 md:-mx-6 flex flex-col">
            <AboutSection
              {...pageContent}
              descriptionTop={pageContent.descriptionTop || pageContent.intro}
              descriptionBottom={pageContent.descriptionBottom || pageContent.body}
              imagePath={pageContent.imagePath || pageContent.image}
            />
            {servicesData && servicesData.length > 0 && (
              <ServicesSection
                services={servicesData as any}
                variant="home"
                initialCategories={categoriesData}
                sectionContent={{
                  sectionKey: 'services',
                  badge: pageContent.servicesBadge || sectionContentData?.services?.badge || '',
                  title: pageContent.servicesTitle || sectionContentData?.services?.title || '',
                  subtitle: pageContent.servicesSubtitle || sectionContentData?.services?.subtitle || '',
                  content: sectionContentData?.services?.content || '',
                }}
              />
            )}
            {referencesData && referencesData.length > 0 && (
              <ReferencesSection
                data={referencesData as any}
                variant="carousel"
                sectionContent={sectionContentData?.references}
              />
            )}
          </div>
        );
      case 'references':
        return <div className="-mx-4 md:-mx-6 py-12"><ReferencesSection data={referencesData as any} sectionContent={pageContent} /></div>;
      case 'contact':
        return <div className="-mx-4 md:-mx-6 py-12"><ContactSection sectionContent={pageContent} /></div>;
      case 'home':
        return <div className="-mx-4 md:-mx-6 mb-12"><MasonryHero data={heroData} heroUi={settings?.uiContent?.hero || ({} as any)} /></div>;
      case 'default':
        return (
          <div className="py-24 border-b border-black/5 last:border-0 px-4 md:px-0">
            <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2 flex flex-col justify-center">
                {pageContent.badge && (
                  <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 w-fit">
                    {pageContent.badge}
                  </span>
                )}
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 text-black italic leading-[1.1]">
                  {pageContent.main_title || targetPage.title}
                </h2>
                <div
                  className="prose prose-slate prose-lg max-w-none prose-p:text-black/70 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-black prose-strong:font-bold"
                  dangerouslySetInnerHTML={{ __html: AiOverviewsHelper.injectAiFriendlyMarkers(pageContent.body || '').replace(/\n/g, '<br />') }}
                />
              </div>
              {pageContent.image && (
                <div className="md:w-1/2 w-full">
                  <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border border-black/5 shadow-blue-900/10 group">
                    <CloudinaryImage
                      src={pageContent.image}
                      alt={targetPage.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div key={blockKey}>
      {renderTemplatePart()}
      {targetBlocks.length > 0 && !isSelfReference && (
        <BlockRenderer
          blocks={targetBlocks}
          servicesData={servicesData}
          referencesData={referencesData}
          statsData={statsData}
          heroData={heroData}
          sectionContentData={sectionContentData}
          branchesData={branchesData}
          categoriesData={categoriesData}
          allPagesData={allPagesData}
          depth={depth + 1}
          renderedPageIds={[...renderedPageIds, String(block.data.pageId)]}
        />
      )}
    </div>
  );
}

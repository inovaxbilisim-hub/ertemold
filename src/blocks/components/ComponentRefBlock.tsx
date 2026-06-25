'use client';
import { useMemo } from 'react';
import MasonryHero from '@/modules/content/sections/MasonryHero';
import ServicesSection from '@/modules/content/sections/ServicesSection';
import StatsSection from '@/modules/content/sections/StatsSection';
import ReferencesSection from '@/modules/content/sections/ReferencesSection';
import ContactSection from '@/modules/content/sections/ContactSection';
import AboutSection from '@/modules/content/sections/AboutSection';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import type { BlockComponentProps } from '@/blocks/types';

export default function ComponentRefBlock({ block, index, settings, heroData, servicesData, statsData, referencesData, sectionContentData, categoriesData: _categoriesData }: BlockComponentProps) {
  const blockKey = `component-ref-${index}`;
  const resolvedComponents = useMemo(() => ({
    Hero: HookRegistry.applyFilters('render_component_hero', MasonryHero),
    Services: HookRegistry.applyFilters('render_component_services', ServicesSection),
    Stats: HookRegistry.applyFilters('render_component_stats', StatsSection),
    References: HookRegistry.applyFilters('render_component_references', ReferencesSection),
    Contact: HookRegistry.applyFilters('render_component_contact', ContactSection),
    About: HookRegistry.applyFilters('render_component_about', AboutSection),
  }), []);

  switch (block.data.component) {
    case 'Hero':
      return <div key={blockKey} className="-mx-4 md:-mx-6 mb-12"><resolvedComponents.Hero data={heroData} heroUi={settings?.uiContent?.hero || ({} as any)} /></div>;
    case 'Services':
      return <div key={blockKey} className="-mx-4 md:-mx-6 py-12"><resolvedComponents.Services services={servicesData || []} sectionContent={sectionContentData?.services} /></div>;
    case 'Stats':
      return <div key={blockKey} className="-mx-4 md:-mx-6 py-12"><resolvedComponents.Stats stats={statsData} /></div>;
    case 'References':
      return <div key={blockKey} className="-mx-4 md:-mx-6 py-12"><resolvedComponents.References data={referencesData || []} sectionContent={sectionContentData?.references} /></div>;
    case 'Contact':
      return <div key={blockKey} className="-mx-4 md:-mx-6 py-12"><resolvedComponents.Contact sectionContent={sectionContentData?.contact} /></div>;
    case 'About':
      return <div key={blockKey} className="-mx-4 md:-mx-6 py-12"><resolvedComponents.About contentData={sectionContentData?.about} /></div>;
    default:
      return null;
  }
}

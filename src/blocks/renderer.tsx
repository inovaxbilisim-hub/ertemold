'use client';
import React, { useCallback } from 'react';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import TextImageBlock from '@/blocks/components/TextImageBlock';
import IframeBlock from '@/blocks/components/IframeBlock';
import ComponentRefBlock from '@/blocks/components/ComponentRefBlock';
import PageRefBlock from '@/blocks/components/PageRefBlock';
import FaqBlock from '@/blocks/components/FaqBlock';
import CheckupBlock from '@/blocks/components/CheckupBlock';
import type { Block, BlockRendererProps } from '@/blocks/types';

const UnknownBlock = ({ block }: { block: Block }) => (
  <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg text-amber-800 text-sm">
    Unknown block type: <code>{block.type}</code>
  </div>
);

const defaultBlockMap: Record<string, React.ComponentType<any>> = {
  text_image: TextImageBlock,
  iframe: IframeBlock,
  component_ref: ComponentRefBlock,
  page_ref: PageRefBlock,
  faq_section: FaqBlock,
  checkup: CheckupBlock,
};

export default function BlockRenderer({
  blocks = [],
  servicesData,
  referencesData,
  statsData,
  heroData,
  sectionContentData,
  branchesData,
  categoriesData,
  allPagesData,
  depth = 0,
  renderedPageIds = [],
  settings,
  locationName,
  serviceName,
}: BlockRendererProps) {

  const renderBlock = useCallback((block: Block, index: number) => {
    if (depth > 5) return null;
    const blockKey = block.id ? `${block.id}-${index}` : `block-${depth}-${index}`;

    // 1. Check hook-based custom block first
    const CustomBlock = HookRegistry.applyFilters('render_block_custom', null, block, { settings, locationName, serviceName });
    if (CustomBlock) return <div key={blockKey}>{CustomBlock}</div>;

    // 2. Check default block map
    const BlockComponent = defaultBlockMap[block.type];
    if (BlockComponent) {
      return (
        <BlockComponent
          key={blockKey}
          block={block}
          index={index}
          settings={settings}
          locationName={locationName}
          serviceName={serviceName}
          servicesData={servicesData}
          referencesData={referencesData}
          statsData={statsData}
          heroData={heroData}
          sectionContentData={sectionContentData}
          branchesData={branchesData}
          categoriesData={categoriesData}
          allPagesData={allPagesData}
          depth={depth}
          renderedPageIds={renderedPageIds}
        />
      );
    }

    // 3. Unknown block type
    return <UnknownBlock key={blockKey} block={block} />;
  }, [depth, settings, locationName, serviceName, servicesData, referencesData, statsData, heroData, sectionContentData, branchesData, categoriesData, allPagesData, renderedPageIds]);

  return (
    <div className={`dynamic-blocks ${depth === 0 ? 'px-4 md:px-6' : ''} space-y-8`}>
      {blocks.map((block: Block, index: number) => renderBlock(block, index))}
    </div>
  );
}

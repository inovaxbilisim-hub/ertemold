'use client';
import FaqSection from '@/modules/content/sections/FaqSection';
import type { BlockComponentProps } from '@/blocks/types';

export default function FaqBlock({ block, index }: BlockComponentProps) {
  return (
    <div key={`faq-${index}`} className="py-12">
      <FaqSection {...(block.data as any)} />
    </div>
  );
}

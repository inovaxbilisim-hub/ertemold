'use client';
import type { BlockComponentProps } from '@/blocks/types';

export default function IframeBlock({ block, index }: BlockComponentProps) {
  return (
    <div key={`iframe-${index}`} className="py-12 border-b border-black/5 last:border-0">
      <div className="max-w-[1240px] mx-auto rounded-[40px] overflow-hidden shadow-2xl border border-black/5 bg-black/5">
        <iframe
          src={block.data.url}
          width="100%"
          height={block.data.height || '450px'}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={block.data.title || 'Dynamic Content'}
        />
      </div>
    </div>
  );
}

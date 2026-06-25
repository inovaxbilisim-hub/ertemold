'use client';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import VisualElement from '@/blocks/VisualElement';
import { AiOverviewsHelper } from '@/domains/seo-engine/aeo/AiOverviewsHelper';
import type { BlockComponentProps } from '@/blocks/types';

export default function TextImageBlock({ block, index, settings: _settings, locationName, serviceName }: BlockComponentProps) {
  const isRight = block.data.layout === 'right';
  const isFull = block.data.layout === 'full';

  return (
    <div key={`text-image-${index}`} className="py-12 border-b border-black/5 last:border-0">
      <div className={`max-w-[1240px] mx-auto flex flex-col ${isFull ? 'items-center' : (isRight ? 'md:flex-row' : 'md:flex-row-reverse')} gap-12`}>
        <div className={isFull ? 'w-full' : 'md:w-1/2 flex flex-col justify-center'}>
          {block.data.title && (
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-black">
              {block.data.title}
            </h2>
          )}
          <div
            className="text-lg text-black/60 font-medium leading-relaxed prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{
              __html: AiOverviewsHelper.injectAiFriendlyMarkers(block.data.text || '').replace(/\n/g, '<br />'),
            }}
          />
        </div>

        {block.data.image ? (
          <div className={isFull ? 'w-full mt-8' : 'md:w-1/2'}>
            <div className={`relative w-full ${isFull ? 'aspect-[21/9]' : 'aspect-square'} rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10 border border-black/5`}>
              <CloudinaryImage
                src={block.data.image}
                alt={(block.data.alt as string) || block.data.title || 'Blok Görseli'}
                fill
                className="object-cover"
                locationName={locationName}
                serviceName={serviceName}
              />
            </div>
          </div>
        ) : block.data.visual_type ? (
          <div className={isFull ? 'w-full mt-8 h-[400px]' : 'md:w-1/2 min-h-[400px]'}>
            <VisualElement type={block.data.visual_type} data={block.data.visual_data} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

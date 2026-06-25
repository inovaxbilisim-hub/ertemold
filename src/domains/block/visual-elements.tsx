'use client';
import React, { Suspense } from 'react';

interface VisualElementRendererProps {
  type: string;
  data?: Record<string, any>;
}

const VisualElementFallback = () => (
  <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />
);

const UnknownVisualElement = ({ type }: { type: string }) => (
  <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg text-amber-800 text-sm">
    Unknown visual element type: <code>{type}</code>
  </div>
);

// ---------------------------------------------------------------------------
// STATIC VISUAL ELEMENT LOADER MAP
// Turbopack/webpack: import() içinde dinamik değişken kullanılamaz.
// Yeni visual element eklendiğinde buraya da eklenmeli.
// ---------------------------------------------------------------------------
const VISUAL_ELEMENT_LOADERS: Record<string, () => Promise<any>> = {
  badges:   () => import('@/domains/block/visual-elements/Badges'),
  glass_map: () => import('@/domains/block/visual-elements/GlassMap'),
};

async function loadVisualElementComponent(type: string): Promise<React.ComponentType<any> | null> {
  const loader = VISUAL_ELEMENT_LOADERS[type];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default || mod[Object.keys(mod)[0]] || null;
  } catch {
    return null;
  }
}

export async function VisualElementRenderer({ type, data }: VisualElementRendererProps) {
  if (!VISUAL_ELEMENT_LOADERS[type]) {
    return <UnknownVisualElement type={type} />;
  }

  const Component = await loadVisualElementComponent(type);
  if (!Component) {
    return <UnknownVisualElement type={type} />;
  }

  return (
    <Suspense fallback={<VisualElementFallback />}>
      <Component data={data} />
    </Suspense>
  );
}
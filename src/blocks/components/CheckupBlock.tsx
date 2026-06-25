'use client';
import ZeminCheckupWidget from '@/modules/content/sections/ZeminCheckupWidget';
import type { BlockComponentProps } from '@/blocks/types';

export default function CheckupBlock(_props: BlockComponentProps) {
  return (
    <div className="py-20">
      <ZeminCheckupWidget />
    </div>
  );
}

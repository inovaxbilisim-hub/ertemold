'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'section_key', label: 'Bölüm Anahtarı' },
  { key: 'title', label: 'Başlık' },
  { key: 'subtitle', label: 'Alt Başlık' },
  { key: 'badge', label: 'Rozet' }
];

const formFields: FormField[] = [
  { key: 'section_key', label: 'Bölüm Anahtarı', type: 'text', required: true, full: true },
  { key: 'badge', label: 'Rozet', type: 'text' },
  { key: 'title', label: 'Başlık', type: 'text', full: true },
  { key: 'subtitle', label: 'Alt Başlık', type: 'text', full: true },
  { key: 'content', label: 'İçerik', type: 'textarea', full: true }
];

export default function SectionContentPage() {
  return <GenericEntityPage entityType="section-content" title="Bölüm İçerikleri" columns={columns} formFields={formFields} searchFields={['title', 'section_key']} />;
}

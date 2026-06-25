'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'title', label: 'Başlık' },
  { key: 'slug', label: 'Slug' },
  {
    key: 'active', label: 'Durum',
    render: (i: any) => i.active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>
  },
];

const formFields: FormField[] = [
  { key: 'title', label: 'Yasal Sayfa Başlığı', type: 'text', required: true, full: true },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'content', label: 'İçerik', type: 'wysiwyg', full: true },
  { key: 'metaDescription', label: 'Meta Açıklama', type: 'textarea', full: true },
  { key: 'active', label: 'Durum', type: 'boolean' },
];

export default function LegalPagePage() {
  return <GenericEntityPage entityType="legal" title="Yasal Sayfalar" columns={columns} formFields={formFields} />;
}

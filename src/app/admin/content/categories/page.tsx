'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'title', label: 'Kategori Adı' },
  { key: 'slug', label: 'Slug' },
  { key: 'sort_order', label: 'Sıra' },
  {
    key: 'active', label: 'Durum',
    render: (i: any) => i.active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>
  },
];

const formFields: FormField[] = [
  { key: 'title', label: 'Kategori Adı', type: 'text', required: true, full: true },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Açıklama', type: 'textarea', full: true },
  { key: 'icon', label: 'İkon', type: 'text' },
  { key: 'color', label: 'Renk', type: 'text' },
  { key: 'sort_order', label: 'Sıra', type: 'number' },
  { key: 'active', label: 'Durum', type: 'boolean' },
];

export default function CategoriesPage() {
  return <GenericEntityPage entityType="service-category" title="Hizmet Kategorileri" columns={columns} formFields={formFields} />;
}

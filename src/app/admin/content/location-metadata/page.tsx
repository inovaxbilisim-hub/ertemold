'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'city_name', label: 'Şehir' },
  { key: 'city_slug', label: 'Slug' },
  { key: 'seo_title', label: 'SEO Title' },
  {
    key: 'is_active', label: 'Durum',
    render: (i: any) => i.is_active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>
  },
];

const formFields: FormField[] = [
  { key: 'city_name', label: 'Şehir Adı', type: 'text', required: true },
  { key: 'city_slug', label: 'Şehir Slug', type: 'text', required: true },
  { key: 'seo_title', label: 'SEO Title', type: 'text', full: true },
  { key: 'seo_description', label: 'SEO Description', type: 'textarea', full: true },
  { key: 'humidity_group', label: 'Nem Grubu (LOW, MED, HIGH)', type: 'text' },
  { key: 'max_temp_summer_c', label: 'En Yüksek Yaz Sıcaklığı (°C)', type: 'number' },
  { key: 'min_temp_winter_c', label: 'En Düşük Kış Sıcaklığı (°C)', type: 'number' },
  { key: 'is_active', label: 'Durum', type: 'boolean' },
];

export default function LocationMetadataPage() {
  return <GenericEntityPage entityType="location-metadata" title="Lokasyon SEO" columns={columns} formFields={formFields} searchFields={['city_name', 'city_slug', 'seo_title']} />;
}

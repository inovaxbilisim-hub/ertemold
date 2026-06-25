'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'name', label: 'Müşteri' },
  { key: 'rating', label: 'Puan', render: (i: any) => <span style={{ color: '#f59e0b' }}>{'★'.repeat(i.rating || 5)}</span> },
  { key: 'service', label: 'Hizmet' },
  { key: 'city', label: 'Şehir' },
  {
    key: 'active', label: 'Durum',
    render: (i: any) => i.active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>
  },
];

const formFields: FormField[] = [
  { key: 'name', label: 'Müşteri Adı', type: 'text', required: true, full: true },
  { key: 'rating', label: 'Puan (1-5)', type: 'number' },
  { key: 'service', label: 'Hizmet', type: 'text' },
  { key: 'city', label: 'Şehir', type: 'text' },
  { key: 'comment', label: 'Yorum', type: 'textarea', full: true },
  { key: 'date', label: 'Tarih', type: 'text' },
  { key: 'active', label: 'Durum', type: 'boolean' },
];

export default function ReviewsPage() {
  return <GenericEntityPage entityType="review" title="Müşteri Yorumları" columns={columns} formFields={formFields} searchFields={['name', 'service', 'comment']} />;
}

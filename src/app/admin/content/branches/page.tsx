'use client';

import GenericEntityPage, { Column, FormField } from '@/app/admin/components/GenericEntityPage';

const columns: Column[] = [
  { key: 'title', label: 'Başlık' },
  { key: 'city', label: 'Şehir' },
  { key: 'phone', label: 'Telefon' },
  { key: 'isMain', label: 'Tip', render: (i: any) => i.isMain ? <span className="badge badge-blue">Merkez</span> : <span className="badge">Bölge</span> },
  {
    key: 'active', label: 'Durum',
    render: (i: any) => i.active !== false ? <span className="badge badge-success">Aktif</span> : <span className="badge">Pasif</span>
  },
];

const formFields: FormField[] = [
  { key: 'title', label: 'Şube Adı', type: 'text', required: true, full: true },
  { key: 'city', label: 'Şehir', type: 'text' },
  { key: 'address', label: 'Adres', type: 'textarea', full: true },
  { key: 'phone', label: 'Telefon', type: 'text' },
  { key: 'email', label: 'E-posta', type: 'text' },
  { key: 'isMain', label: 'Merkez Şube', type: 'boolean' },
  { key: 'sort_order', label: 'Sıra', type: 'number' },
  { key: 'active', label: 'Durum', type: 'boolean' },
];

export default function BranchesPage() {
  return <GenericEntityPage entityType="branch" title="Şubeler" columns={columns} formFields={formFields} searchFields={['title', 'city']} />;
}

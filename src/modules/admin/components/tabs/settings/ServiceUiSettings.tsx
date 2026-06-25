'use client';

import { useEffect, useState } from 'react';
import type { SiteSettings, CategoryPageItemUiContent, ServiceCategory } from '@/core/types';
import { SettingsPanel, SettingsCard, renderFields } from './SharedFields';

interface ServiceUiSettingsProps {
  settings: SiteSettings;
  updateUiSection: <K extends keyof SiteSettings['uiContent'], F extends keyof SiteSettings['uiContent'][K]>(
    section: K,
    field: F,
    value: SiteSettings['uiContent'][K][F]
  ) => void;
  updateCategoryPage: <F extends keyof CategoryPageItemUiContent>(
    category: string,
    field: F,
    value: CategoryPageItemUiContent[F]
  ) => void;
}

function CategoryPageCard({
  title,
  content,
  onChange,
}: {
  title: string;
  content: CategoryPageItemUiContent;
  onChange: (field: keyof CategoryPageItemUiContent, value: string) => void;
}) {
  const defaultContent: CategoryPageItemUiContent = {
    backLabel: '',
    badge: '',
    titlePrefix: '',
    titleAccent: '',
    titleSuffix: '',
    description: '',
  };

  const safeContent = { ...defaultContent, ...content };

  return (
    <div className="admin-card admin-settings-subcard">
      <h6 className="admin-settings-card-title admin-settings-card-title-small italic uppercase">{title}</h6>
      {renderFields([
        { label: 'Geri Metni', value: safeContent.backLabel, onChange: (value) => onChange('backLabel', value) },
        { label: 'Rozet', value: safeContent.badge, onChange: (value) => onChange('badge', value) },
        { label: 'Başlık Sol', value: safeContent.titlePrefix, onChange: (value) => onChange('titlePrefix', value) },
        { label: 'Başlık Vurgu', value: safeContent.titleAccent, onChange: (value) => onChange('titleAccent', value) },
        { label: 'Başlık Son', value: safeContent.titleSuffix, onChange: (value) => onChange('titleSuffix', value) },
        { label: 'Açıklama', value: safeContent.description, onChange: (value) => onChange('description', value), multiline: true },
      ])}
    </div>
  );
}

export default function ServiceUiSettings({ settings, updateUiSection, updateCategoryPage }: ServiceUiSettingsProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    fetch('/api/admin/service-categories')
      .then(res => res.json())
      .then(json => {
        const list = json?.data;
        if (Array.isArray(list)) setCategories(list);
      })
      .catch(console.error);
  }, []);

  return (
    <SettingsPanel title="Hizmet ve Lokasyon UI" fullWidth>
      <div className="admin-settings-cards-grid">
        <SettingsCard title="Hizmet Detay Sayfası">
          {renderFields([
            {
              label: 'Ana CTA Metni',
              value: settings.uiContent.serviceDetail?.primaryCtaText || '',
              onChange: (value) => updateUiSection('serviceDetail', 'primaryCtaText', value),
            },
            {
              label: 'Destek Başlığı',
              value: settings.uiContent.serviceDetail?.supportTitle || '',
              onChange: (value) => updateUiSection('serviceDetail', 'supportTitle', value),
            },
            {
              label: 'Destek Alt Metni',
              value: settings.uiContent.serviceDetail?.supportSubtitle || '',
              onChange: (value) => updateUiSection('serviceDetail', 'supportSubtitle', value),
            },
            {
              label: 'Hizmet Başlığı',
              value: settings.uiContent.serviceDetail?.servicesTitle || '',
              onChange: (value) => updateUiSection('serviceDetail', 'servicesTitle', value),
            },
            {
              label: 'Şubeler Başlık',
              value: settings.uiContent.serviceDetail?.branchesTitle || '',
              onChange: (value) => updateUiSection('serviceDetail', 'branchesTitle', value),
            },
            {
              label: 'Alt CTA Başlık',
              value: settings.uiContent.serviceDetail?.ctaBottomTitle || '',
              onChange: (value) => updateUiSection('serviceDetail', 'ctaBottomTitle', value),
            },
            {
              label: 'Alt CTA Buton',
              value: settings.uiContent.serviceDetail?.ctaBottomButtonText || '',
              onChange: (value) => updateUiSection('serviceDetail', 'ctaBottomButtonText', value),
            },
          ])}
        </SettingsCard>

        <SettingsCard title="Lokasyon Detay Sayfası">
          {renderFields([
            {
              label: 'Ana Başlık (Örn: Profesyonel)',
              value: settings.uiContent.locationDetail?.titlePrefix || '',
              onChange: (value) => updateUiSection('locationDetail', 'titlePrefix', value),
            },
            {
              label: 'Başlık Son eki (Örn: Hizmetleri)',
              value: settings.uiContent.locationDetail?.titleSuffix || '',
              onChange: (value) => updateUiSection('locationDetail', 'titleSuffix', value),
            },
            {
              label: 'Alt Başlık',
              value: settings.uiContent.locationDetail?.subtitle || '',
              onChange: (value) => updateUiSection('locationDetail', 'subtitle', value),
              multiline: true,
            },
          ])}
        </SettingsCard>

        <SettingsCard title="Hizmet Lokasyon (pSEO) Sayfası">
          {renderFields([
            {
              label: 'Bölge Rozet Eki',
              value: settings.uiContent.serviceLocation?.heroBadgeSuffix || '',
              onChange: (value) => updateUiSection('serviceLocation', 'heroBadgeSuffix', value),
            },
            {
              label: 'Ana Başlık (pSEO)',
              value: settings.uiContent.serviceLocation?.locationServiceTitle || '',
              onChange: (value) => updateUiSection('serviceLocation', 'locationServiceTitle', value),
            },
            {
              label: 'Müdahale Başlığı',
              value: settings.uiContent.serviceLocation?.responseTitle || '',
              onChange: (value) => updateUiSection('serviceLocation', 'responseTitle', value),
            },
            {
              label: 'Ücretsiz Bilgi Metni',
              value: settings.uiContent.serviceLocation?.freeDiscoveryCta || '',
              onChange: (value) => updateUiSection('serviceLocation', 'freeDiscoveryCta', value),
            },
            {
              label: 'İstatistik: Destek Etiketi',
              value: settings.uiContent.serviceLocation?.stats1Label || '',
              onChange: (value) => updateUiSection('serviceLocation', 'stats1Label', value),
            },
            {
              label: 'İstatistik: Deneyim Etiketi',
              value: settings.uiContent.serviceLocation?.stats2Label || '',
              onChange: (value) => updateUiSection('serviceLocation', 'stats2Label', value),
            },
            {
              label: 'İstatistik: Memnuniyet Etiketi',
              value: settings.uiContent.serviceLocation?.stats3Label || '',
              onChange: (value) => updateUiSection('serviceLocation', 'stats3Label', value),
            },
            {
              label: 'İstatistik: Referans Etiketi',
              value: settings.uiContent.serviceLocation?.stats4Label || '',
              onChange: (value) => updateUiSection('serviceLocation', 'stats4Label', value),
            },
          ])}
        </SettingsCard>

        <SettingsCard title="Zemin Check-Up Modülü">
          {renderFields([
            {
              label: 'Modül Başlığı',
              value: settings.uiContent.checkupWidget?.title || '',
              onChange: (value) => updateUiSection('checkupWidget', 'title', value),
            },
            {
              label: 'Modül Alt Başlığı',
              value: settings.uiContent.checkupWidget?.subtitle || '',
              onChange: (value) => updateUiSection('checkupWidget', 'subtitle', value),
            },
            {
              label: 'Başlama Butonu Metni',
              value: settings.uiContent.checkupWidget?.buttonText || '',
              onChange: (value) => updateUiSection('checkupWidget', 'buttonText', value),
            },
            {
              label: 'Sonuç Ekranı: Başlık',
              value: settings.uiContent.checkupWidget?.resultTitle || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultTitle', value),
            },
            {
              label: 'Sonuç Ekranı: Açıklama',
              value: settings.uiContent.checkupWidget?.resultSubtitle || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultSubtitle', value),
              multiline: true,
            },
            {
              label: 'Özellik 1',
              value: settings.uiContent.checkupWidget?.resultFeature1 || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultFeature1', value),
            },
            {
              label: 'Özellik 2',
              value: settings.uiContent.checkupWidget?.resultFeature2 || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultFeature2', value),
            },
            {
              label: 'Özellik 3',
              value: settings.uiContent.checkupWidget?.resultFeature3 || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultFeature3', value),
            },
            {
              label: 'Sonuç Ekranı CTA Butonu',
              value: settings.uiContent.checkupWidget?.resultCtaText || '',
              onChange: (value) => updateUiSection('checkupWidget', 'resultCtaText', value),
            },
            {
              label: 'Adımlar (Gelişmiş JSON)',
              value: settings.uiContent.checkupWidget?.stepsJson || '',
              onChange: (value) => updateUiSection('checkupWidget', 'stepsJson', value),
              multiline: true,
            },
          ])}
          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>Bilgi:</strong> Check-up adımlarını, seçenekleri ve simgeleri "Adımlar (Gelişmiş JSON)" alanından düzenleyebilirsiniz. JSON formatının doğru olduğundan emin olun. Boş bırakırsanız sistem varsayılan adımları kullanır.
          </div>
        </SettingsCard>

        <div className="admin-settings-full-row">
          <h5 className="admin-settings-subgroup-title">Kategori Listeleme Sayfaları</h5>
          <div className="admin-settings-cards-grid">
            {categories.map((cat) => (
              <CategoryPageCard
                key={cat.id}
                title={cat.name}
                content={settings.uiContent.categoryPages?.[String(cat.id)] || {} as any}
                onChange={(field, value) => updateCategoryPage(String(cat.id), field, value)}
              />
            ))}
            {categories.length === 0 && (
              <p className="text-black/30 text-sm italic col-span-full text-center py-8">
                Henüz kategori tanımlanmamış.
              </p>
            )}
          </div>
        </div>
      </div>
    </SettingsPanel>
  );
}

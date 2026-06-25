'use client';

import type { SiteSettings } from '@/core/types';
import { SettingsPanel, TextField, ImagePathField, renderFields, CheckboxField, SelectField } from './SharedFields';

interface BrandSettingsProps {
  settings: SiteSettings;
  updateSetting: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export default function BrandSettings({ settings, updateSetting }: BrandSettingsProps) {
  const updateBrand = (value: SiteSettings['brand']) => updateSetting('brand', value);
  const updateAnnouncement = (value: SiteSettings['announcement']) => updateSetting('announcement', value);

  return (
    <>
      <SettingsPanel title="Marka ve Logo">
        {renderFields([
          { label: 'Site Başlığı', value: settings.title || '', onChange: (value) => updateSetting('title', value) },
          { label: 'Site URL (Canonical)', value: settings.siteUrl || '', onChange: (value) => updateSetting('siteUrl', value) },
          { label: 'Firma Adı', value: settings.companyName || '', onChange: (value) => updateSetting('companyName', value) },
        ])}

        <ImagePathField
          label="Site Logosu"
          pickerLabel="Bilgisayardan Yükle / Seç"
          value={settings.brand?.logoPath || ''}
          onChange={(value) => updateBrand({ ...settings.brand, logoPath: value })}
        />

        <div className="admin-settings-two-col">
          {renderFields([
            {
              label: 'Logo Genişlik',
              type: 'number',
              value: settings.brand?.logoMaxWidth?.toString() || '',
              onChange: (value) =>
                updateBrand({ ...settings.brand, logoMaxWidth: Number.parseInt(value, 10) || undefined }),
            },
            {
              label: 'Logo Yükseklik',
              type: 'number',
              value: settings.brand?.logoMaxHeight?.toString() || '',
              onChange: (value) =>
                updateBrand({ ...settings.brand, logoMaxHeight: Number.parseInt(value, 10) || undefined }),
            },
          ])}
        </div>

        <ImagePathField
          label="Footer Logosu"
          pickerLabel="Footer Logosu Seç / Yükle"
          value={settings.brand?.footerLogoPath || ''}
          onChange={(value) => updateBrand({ ...settings.brand, footerLogoPath: value })}
        />

        <ImagePathField
          label="Favicon"
          pickerLabel="Favicon Seç / Yükle"
          value={settings.brand?.faviconPath || ''}
          onChange={(value) => updateBrand({ ...settings.brand, faviconPath: value })}
        />

        <TextField
          label="Şirket Açıklaması"
          value={settings.companyDescription || ''}
          onChange={(value) => updateSetting('companyDescription', value)}
          multiline
        />
      </SettingsPanel>

      <SettingsPanel title="Duyuru Çubuğu">
        <CheckboxField
          id="announcement-active"
          label="Aktif mi?"
          checked={settings.announcement?.active ?? false}
          onChange={(value) => updateAnnouncement({ ...settings.announcement, active: value })}
        />

        {renderFields([
          {
            label: 'Duyuru Metni',
            value: settings.announcement?.text || '',
            onChange: (value) => updateAnnouncement({ ...settings.announcement, text: value }),
          },
          {
            label: 'Link',
            value: settings.announcement?.link || '',
            onChange: (value) => updateAnnouncement({ ...settings.announcement, link: value }),
          },
        ])}

        <SelectField<NonNullable<SiteSettings['geoService']>>
          label="Konum Servisi"
          value={settings.geoService || 'vercel'}
          onChange={(value) => updateSetting('geoService', value)}
          options={[
            { label: 'Devre Dışı', value: 'none' },
            { label: 'Vercel Edge', value: 'vercel' },
            { label: 'ipapi.co', value: 'ipapi' },
          ]}
        />
      </SettingsPanel>

      <SettingsPanel title="İletişim Bilgileri" fullWidth>
        <div className="admin-settings-two-col">
          {renderFields([
            { label: 'E-posta', value: settings.email || '', onChange: (value) => updateSetting('email', value) },
            { label: 'Telefon', value: settings.phone || '', onChange: (value) => updateSetting('phone', value) },
            { label: 'WhatsApp', value: settings.whatsapp || '', onChange: (value) => updateSetting('whatsapp', value) },
            { label: 'Harita Linki', value: settings.mapsLink || '', onChange: (value) => updateSetting('mapsLink', value) },
          ])}
          <div className="mt-4">
            <CheckboxField
              id="show-whatsapp"
              label="WhatsApp Destek Butonunu Göster"
              checked={settings.showWhatsApp ?? true}
              onChange={(value) => updateSetting('showWhatsApp', value)}
            />
            <p className="admin-settings-hint">Ziyaretçilerin sağ altta yüzen WhatsApp ikonunu görüp göremeyeceğini belirler.</p>
          </div>
          {renderFields([
            { label: 'Adres', value: settings.address || '', onChange: (value) => updateSetting('address', value), multiline: true, rows: 2, spanFull: true },
            {
              label: 'Çalışma Saatleri',
              value: settings.workingHours || '',
              onChange: (value) => updateSetting('workingHours', value),
              spanFull: true,
            },
          ])}
        </div>
      </SettingsPanel>

      <SettingsPanel title="Kod Enjeksiyonu ve GTM" fullWidth>
        <TextField
          label="Google Tag Manager (GTM) ID"
          placeholder="GTM-XXXXXXX"
          value={settings.codeInjection?.gtmId || ''}
          onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, gtmId: value })}
        />
        <p className="admin-settings-hint mb-6">GTM ID girdiğinizde temel script ve noscript blokları otomatik enjekte edilir.</p>

        <div className="admin-settings-grid gap-8 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="admin-label m-0">Head Bölümü (HTML/JS)</label>
              <CheckboxField
                id="head-active"
                label="Aktif"
                checked={settings.codeInjection?.headActive ?? false}
                onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, headActive: value })}
              />
            </div>
            <TextField
              label=""
              placeholder="<!-- Head içine eklenecek kodlar -->"
              value={settings.codeInjection?.headCode || ''}
              onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, headCode: value })}
              multiline
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="admin-label m-0">Body Başlangıç (HTML/JS)</label>
              <CheckboxField
                id="body-start-active"
                label="Aktif"
                checked={settings.codeInjection?.bodyStartActive ?? false}
                onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, bodyStartActive: value })}
              />
            </div>
            <TextField
              label=""
              placeholder="<!-- <body> açılışından hemen sonra -->"
              value={settings.codeInjection?.bodyStartCode || ''}
              onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, bodyStartCode: value })}
              multiline
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="admin-label m-0">Body Bitiş (HTML/JS)</label>
              <CheckboxField
                id="body-end-active"
                label="Aktif"
                checked={settings.codeInjection?.bodyEndActive ?? false}
                onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, bodyEndActive: value })}
              />
            </div>
            <TextField
              label=""
              placeholder="<!-- </body> kapanışından hemen önce -->"
              value={settings.codeInjection?.bodyEndCode || ''}
              onChange={(value) => updateSetting('codeInjection', { ...settings.codeInjection, bodyEndCode: value })}
              multiline
              rows={4}
            />
          </div>
        </div>
      </SettingsPanel>
    </>
  );
}

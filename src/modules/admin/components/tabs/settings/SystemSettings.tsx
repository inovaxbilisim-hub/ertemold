'use client';

import type { SiteSettings } from '@/core/types';
import { SettingsPanel, TextField, renderFields, CheckboxField } from './SharedFields';

interface SystemSettingsProps {
  settings: SiteSettings;
  updateSetting: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export default function SystemSettings({ settings, updateSetting }: SystemSettingsProps) {
  const updateSmtp = (value: SiteSettings['smtp']) => updateSetting('smtp', value);

  return (
    <>


      <SettingsPanel title="SMTP (E-posta Gönderim Ayarları)" fullWidth>
        <div className="mb-6 p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
          <h4 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"/><path d="m22 7-10 7L2 7"/></svg>
            Gmail SMTP Kullanım Rehberi
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Gmail kullanıyorsanız şifre kısmına normal şifrenizi değil, Google hesabınızdan alacağınız 16 haneli <strong>Uygulama Şifresini</strong> yazmalısınız.
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://myaccount.google.com/apppasswords" 
              target="_blank" 
              className="text-[10px] bg-white border border-blue-600/20 text-blue-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              1. Uygulama Şifresi Al
            </a>
            <a 
              href="https://myaccount.google.com/signinoptions/two-step-verification" 
              target="_blank" 
              className="text-[10px] bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm"
            >
              2. İki Adımlı Doğrulamayı Aç
            </a>
          </div>
        </div>

        <div className="admin-settings-auto-grid">
          {renderFields([
            {
              label: 'Host (Gmail için: smtp.gmail.com)',
              value: settings.smtp?.host || '',
              onChange: (value) => updateSmtp({ ...settings.smtp, host: value }),
            },
            {
              label: 'Port (Gmail için: 465)',
              type: 'number',
              value: settings.smtp?.port?.toString() || '',
              onChange: (value) => updateSmtp({ ...settings.smtp, port: Number.parseInt(value, 10) || 587 }),
            },
            {
              label: 'Kullanıcı (Gmail Adresiniz)',
              value: settings.smtp?.user || '',
              onChange: (value) => updateSmtp({ ...settings.smtp, user: value }),
            },
            {
              label: 'Uygulama Şifresi (16 Haneli)',
              type: 'password',
              value: settings.smtp?.pass || '',
              onChange: (value) => updateSmtp({ ...settings.smtp, pass: value }),
            },
          ])}
        </div>

        <div className="admin-form-group admin-settings-field-full">
          <label className="admin-label">Form Alıcı E-postalar</label>
          <div className="admin-settings-email-list">
            {(
              settings.contactEmails && settings.contactEmails.length > 0
                ? settings.contactEmails
                : settings.contactEmail
                  ? [settings.contactEmail]
                  : []
            ).map((email, index) => (
              <div key={index} className="admin-settings-email-row">
                <input
                  className="admin-input"
                  type="text"
                  placeholder="contact@firma.com"
                  value={email}
                  onChange={(event) => {
                    const currentEmails = settings.contactEmails && settings.contactEmails.length > 0
                      ? [...settings.contactEmails]
                      : settings.contactEmail
                        ? [settings.contactEmail]
                        : [];
                    currentEmails[index] = event.target.value;
                    updateSetting('contactEmails', currentEmails.filter((item) => item.trim() !== ''));
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-danger admin-settings-email-remove"
                  onClick={() => {
                    const currentEmails = settings.contactEmails && settings.contactEmails.length > 0
                      ? [...settings.contactEmails]
                      : settings.contactEmail
                        ? [settings.contactEmail]
                        : [];
                    const nextEmails = currentEmails.filter((_, i) => i !== index).filter((item) => item.trim() !== '');
                    updateSetting('contactEmails', nextEmails);
                  }}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
          <div className="admin-settings-email-actions">
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-dashed"
              onClick={() => {
                const currentEmails = settings.contactEmails && settings.contactEmails.length > 0
                  ? [...settings.contactEmails]
                  : settings.contactEmail
                    ? [settings.contactEmail]
                    : [];
                updateSetting('contactEmails', [...currentEmails, '']);
              }}
            >
              E-posta ekle
            </button>
          </div>
        </div>

        <CheckboxField
          id="smtp-secure"
          label="Secure (Gmail/465 için Aktif Edin)"
          checked={settings.smtp?.secure ?? false}
          onChange={(value) => updateSmtp({ ...settings.smtp, secure: value })}
        />
      </SettingsPanel>

      <SettingsPanel title="Medya ve Depolama (Cloudinary)" fullWidth>
        <div className="mb-6 p-4 bg-teal-600/5 border border-teal-600/10 rounded-2xl">
          <h4 className="text-sm font-bold text-teal-600 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            Medya Yapılandırması
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Buradaki alanlar boş bırakılırsa <code>.env</code> dosyasındaki varsayılan değerler kullanılır. 
            Eğer farklı bir Cloudinary hesabı kullanmak isterseniz burayı doldurabilirsiniz.
          </p>
        </div>

        <div className="admin-settings-auto-grid">
          {renderFields([
            {
              label: 'Cloud Name',
              value: settings.cloudinary_cloud_name || '',
              onChange: (value) => updateSetting('cloudinary_cloud_name', value),
              placeholder: 'Örn: dyz6jfhea'
            },
            {
              label: 'API Key',
              value: settings.cloudinary_api_key || '',
              onChange: (value) => updateSetting('cloudinary_api_key', value),
              placeholder: '425753655618288'
            },
            {
              label: 'API Secret',
              type: 'password',
              value: settings.cloudinary_api_secret || '',
              onChange: (value) => updateSetting('cloudinary_api_secret', value),
              placeholder: '••••••••••••••••'
            },
            {
              label: 'Upload Preset (Opsiyonel)',
              value: settings.cloudinary_upload_preset || '',
              onChange: (value) => updateSetting('cloudinary_upload_preset', value),
              placeholder: 'ml_default'
            },
          ])}
        </div>
      </SettingsPanel>

      <SettingsPanel title="Programmatic SEO (pSEO)" fullWidth>
        <div className="admin-settings-two-col">
          <div className="admin-form-group">
            <label className="admin-label">pSEO Modu</label>
            <select 
              className="admin-select" 
              value={settings.pseo_mode || 'off'} 
              onChange={e => updateSetting('pseo_mode', e.target.value as any)}
            >
              <option value="off">Kapalı</option>
              <option value="branch_based">Sadece Şubeler (Şehir + İlçe)</option>
              <option value="country_based">Tüm Ülke (Kapsamlı)</option>
            </select>
          </div>

          {settings.pseo_mode === 'country_based' && (
            <div className="admin-form-group">
              <p className="admin-settings-hint" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
                Ülke bazlı mod aktif. Tüm iller ve ilçeler için dinamik sayfalar üretilecektir.
              </p>
            </div>
          )}

          <TextField
            label="Hedef Ülke"
            value={settings.pseo_country || 'Türkiye'}
            onChange={(value) => updateSetting('pseo_country', value)}
          />

          <div className="admin-form-group col-span-2">
            <p className="admin-settings-hint" style={{ marginBottom: '16px' }}>
              Bu alanlar, pSEO sayfalarında kullanılacak ana kalıp değerlerdir. Hizmet bazında özel değer tanımlanmadığında burada kaydedilen değerler devreye girer.
            </p>
          </div>

          <TextField
            label="pSEO Konum Takısı (Örn: Bölgesinde)"
            value={settings.pseo_location_suffix || 'Bölgesinde'}
            onChange={(value) => updateSetting('pseo_location_suffix', value)}
          />

          <TextField
            label="Varsayılan pSEO Son Ek (Suffix)"
            value={settings.pseo_service_suffix || ''}
            placeholder="Örn: Çözümleri"
            onChange={(value) => updateSetting('pseo_service_suffix', value)}
          />

          <TextField
            label="Varsayılan pSEO Ön Ek (Prefix)"
            value={settings.pseo_action_verb || ''}
            placeholder="Örn: Uygulama"
            onChange={(value) => updateSetting('pseo_action_verb', value)}
          />

          <div className="admin-form-group col-span-2 mt-4 pt-4 border-t border-black/5">
            <h4 className="text-sm font-bold text-black/60 uppercase tracking-widest mb-6">Gelişmiş SEO ve Dönüşüm</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <CheckboxField
                  id="pseo-internal-linking"
                  label="Akıllı İç Linkleme (Sektörel Bağlar)"
                  checked={settings.pseo_internal_linking ?? true}
                  onChange={(value) => updateSetting('pseo_internal_linking', value)}
                />
                <p className="text-xs text-black/40">Aynı bölgedeki ilgili diğer hizmetleri sayfanın altında otomatik olarak listeler.</p>
              </div>

              <div className="space-y-4">
                <CheckboxField
                  id="pseo-social-proof"
                  label="Canlı Sosyal Kanıt (Dinamik Talep)"
                  checked={settings.pseo_social_proof ?? true}
                  onChange={(value) => updateSetting('pseo_social_proof', value)}
                />
                <p className="text-xs text-black/40">Sayfalarda rastgele oluşturulmuş canlı talep/başvuru sayıları gösterir.</p>
              </div>
            </div>

            {/* Content Quality Threshold Settings */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-black mb-2">İçerik Kalitesi & Eşik Değerleri</h3>
                <p className="text-sm text-black/60 mb-6">
                  Thin content'i önlemek için şehir sayfalarının oluşturulması için minimum veri gereksinimlerini belirleyin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextField
                  label="Min. Proje Sayısı"
                  type="number"
                  value={settings.content_min_projects?.toString() || '2'}
                  onChange={(value) => updateSetting('content_min_projects', Number(value) || 2)}
                />
                <TextField
                  label="Min. Referans Sayısı"
                  type="number"
                  value={settings.content_min_references?.toString() || '1'}
                  onChange={(value) => updateSetting('content_min_references', Number(value) || 1)}
                />
                <div className="flex items-center gap-3">
                  <CheckboxField
                    id="content-redirect"
                    label="Ana Sayfaya Yönlendir"
                    checked={settings.content_redirect_to_main ?? true}
                    onChange={(value) => updateSetting('content_redirect_to_main', value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">
                  <strong>Nasıl Çalışır:</strong> Bir şehir sayfası oluşturulurken, o şehir için minimum proje VEYA referans sayısı kontrolü yapılır. 
                  Eşik değer sağlanmazsa sayfa ana hizmet sayfasına yönlendirilir (thin content önlenir).
                </p>
              </div>

              <div className="space-y-4">
                <CheckboxField
                  id="pseo-simulated-stats"
                  label="Simüle Edilmiş Şehir İstatistikleri (ÖNERİLMEZ)"
                  checked={settings.pseo_simulated_stats ?? false}
                  onChange={(value) => updateSetting('pseo_simulated_stats', value)}
                />
                <p className="text-xs text-red-600">⚠️ Bu ayar Google tarafından fake content olarak algılanabilir. Kapalı tutmanız önerilir.</p>
              </div>
            </div>

            {settings.pseo_social_proof && (
              <div className="mt-8 p-6 bg-blue-600/5 rounded-2xl border border-blue-600/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextField
                  label="Min. Sayı"
                  type="number"
                  value={settings.pseo_social_proof_min?.toString() || '9'}
                  onChange={(value) => updateSetting('pseo_social_proof_min', Number(value))}
                />
                <TextField
                  label="Max. Sayı"
                  type="number"
                  value={settings.pseo_social_proof_max?.toString() || '150'}
                  onChange={(value) => updateSetting('pseo_social_proof_max', Number(value))}
                />
                <TextField
                  label="Mesaj Şablonu ({n} sayı yeridir)"
                  value={settings.pseo_social_proof_text || ''}
                  onChange={(value) => updateSetting('pseo_social_proof_text', value)}
                />
              </div>
            )}
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Sitemap Ayarları" fullWidth>
        <TextField
          label="Chunk Boyutu (URL sayısı)"
          type="number"
          value={settings.sitemapChunkSize !== undefined ? settings.sitemapChunkSize.toString() : '0'}
          onChange={(value) => {
            const num = Number.parseInt(value, 10);
            updateSetting('sitemapChunkSize', isNaN(num) ? 0 : num);
          }}
        />
        <p className="admin-settings-hint">
          <strong>0</strong> girilirse sitemap tek dosya olarak üretilir.
          <strong> 500</strong> veya daha büyük bir değer girildiğinde{' '}
          <code>/sitemap.xml</code> bir index dosyasına dönüşür ve her parçada
          en fazla bu kadar URL yer alır.
        </p>
      </SettingsPanel>
    </>
  );
}

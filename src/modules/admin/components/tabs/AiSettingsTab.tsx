"use client";

import { useState, useEffect } from 'react';
import { SiteSettings } from '@/core/types';
import { Save, Bot, Loader2 } from 'lucide-react';

interface AiSettingsTabProps {
  settings: SiteSettings;
  setSettings: (settings: SiteSettings) => void;
  onSave: () => void;
  saving: boolean;
}

export default function AiSettingsTab({ settings, setSettings, onSave, saving }: AiSettingsTabProps) {
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  useEffect(() => {
    async function fetchModels() {
      const isGemini = settings.ai_provider === 'gemini';
      
      if (!settings.ai_provider && (settings.openrouter_api_key || settings.gemini_api_key)) {
        updateSettings({
          ai_provider: settings.openrouter_api_key ? 'openrouter' : 'gemini'
        });
      }

      setLoadingModels(true);
      try {
        const providerQuery = isGemini ? 'gemini' : 'openrouter';
        const res = await fetch(`/api/admin/ai-models?provider=${providerQuery}&t=${Date.now()}`);
        const data = await res.json();

        if (isGemini) {
          if (data && data.models) {
            const filtered = data.models
              .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
              .map((m: any) => ({
                id: m.name.split('/').pop(),
                name: m.displayName || m.name,
                isFree: true
              }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
            setModels(filtered);
            if (!settings.gemini_ai_model && filtered.length > 0) {
              updateSettings({ gemini_ai_model: filtered[0].id });
            }
          } else {
            setModels([]);
          }
        } else {
          if (data && data.data) {
            const sorted = data.data.map((m: any) => ({
              id: m.id,
              name: m.name,
              isFree: m.id.includes(':free') || m.pricing?.prompt === "0"
            })).sort((a: any, b: any) => {
              if (a.isFree && !b.isFree) return -1;
              if (!a.isFree && b.isFree) return 1;
              return a.name.localeCompare(b.name);
            });
            setModels(sorted);
            if (!settings.openrouter_ai_model && sorted.length > 0) {
              const freeModel = sorted.find((m: any) => m.isFree) || sorted[0];
              updateSettings({ openrouter_ai_model: freeModel.id });
            }
          } else {
            setModels([]);
          }
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    }
    
    fetchModels();
  }, [settings.openrouter_api_key, settings.gemini_api_key, settings.ai_provider]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* API Provider Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '12px' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Yapay Zeka Bağlantısı</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Sistemin içerik üretebilmesi için bir yapay zeka sağlayıcısı seçin.</p>
          </div>
        </div>

        <div className="admin-form-group" style={{ marginBottom: '24px' }}>
          <label className="admin-label">Aktif Sağlayıcı</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: `2px solid ${settings.ai_provider === 'openrouter' || !settings.ai_provider ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '8px', backgroundColor: settings.ai_provider === 'openrouter' || !settings.ai_provider ? '#eff6ff' : '#fff' }}>
              <input 
                type="radio" 
                name="ai_provider" 
                value="openrouter" 
                checked={settings.ai_provider === 'openrouter' || !settings.ai_provider} 
                onChange={() => updateSettings({ ai_provider: 'openrouter' })} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>OpenRouter</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: `2px solid ${settings.ai_provider === 'gemini' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '8px', backgroundColor: settings.ai_provider === 'gemini' ? '#eff6ff' : '#fff' }}>
              <input 
                type="radio" 
                name="ai_provider" 
                value="gemini" 
                checked={settings.ai_provider === 'gemini'} 
                onChange={() => updateSettings({ ai_provider: 'gemini' })} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Google Gemini (Tavsiye Edilen)</span>
            </label>
          </div>
        </div>

        {/* OpenRouter API Key — always visible */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          padding: '16px', borderRadius: '8px',
          border: `1px solid ${settings.ai_provider !== 'gemini' ? '#6366f1' : '#e2e8f0'}`,
          backgroundColor: settings.ai_provider !== 'gemini' ? '#f5f3ff' : '#fafafa',
          opacity: settings.ai_provider === 'gemini' ? 0.6 : 1,
          transition: 'all 0.2s ease',
        }}>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label">OpenRouter API Key</label>
            <input
              type="text"
              className="admin-input"
              value={settings.openrouter_api_key || ''}
              onChange={(e) => updateSettings({ openrouter_api_key: e.target.value })}
              placeholder="sk-or-v1-..."
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              OpenRouter üzerinden yüzlerce modele erişebilirsiniz.{' '}
              {settings.openrouter_api_key ? '✅ Key girilmiş' : ''}
            </p>
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label">Kullanılacak Model (OpenRouter)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="admin-select"
                value={settings.ai_provider !== 'gemini' ? (settings.openrouter_ai_model || settings.ai_model || '') : ''}
                onChange={(e) => updateSettings({ openrouter_ai_model: e.target.value })}
                disabled={loadingModels || !settings.openrouter_api_key || settings.ai_provider === 'gemini'}
              >
                <option value="">-- Model Seçin --</option>
                {settings.ai_provider !== 'gemini' && models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.isFree ? '🎁 ÜCRETSİZ - ' : ''}{m.name} ({m.id})
                  </option>
                ))}
              </select>
              {loadingModels && settings.ai_provider !== 'gemini' && <Loader2 size={18} className="spin" style={{ color: '#4f46e5' }} />}
            </div>
          </div>
        </div>

        {/* Extra OpenRouter Keys (key rotation pool) */}
        {settings.ai_provider !== 'gemini' && (
          <div style={{
            padding: '16px', borderRadius: '8px',
            border: '1px dashed #6366f1',
            backgroundColor: '#f5f3ff',
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#4338ca' }}>🔄 Yedek OpenRouter Key'leri (Otomatik Rotasyon)</strong>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Birincil key 429 / kota hatası verirse sistem sıradaki key'i otomatik dener.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray((settings as any).openrouter_api_keys) ? (settings as any).openrouter_api_keys : [];
                  updateSettings({ openrouter_api_keys: [...current, ''] } as any);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px',
                  backgroundColor: '#4f46e5', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                + Key Ekle
              </button>
            </div>

            {Array.isArray((settings as any).openrouter_api_keys) && (settings as any).openrouter_api_keys.length === 0 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                Henüz yedek key eklenmedi. "Key Ekle" butonuyla birden fazla API key tanımlayabilirsiniz.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Array.isArray((settings as any).openrouter_api_keys) ? (settings as any).openrouter_api_keys : []).map((key: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', minWidth: '28px' }}>#{idx + 2}</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={key}
                    placeholder="sk-or-v1-..."
                    style={{ flex: 1, borderColor: '#a5b4fc', marginBottom: 0 }}
                    onChange={(e) => {
                      const currentKeys = Array.isArray((settings as any).openrouter_api_keys) ? (settings as any).openrouter_api_keys : [];
                      const arr = [...currentKeys];
                      arr[idx] = e.target.value;
                      updateSettings({ openrouter_api_keys: arr } as any);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentKeys = Array.isArray((settings as any).openrouter_api_keys) ? (settings as any).openrouter_api_keys : [];
                      const arr = [...currentKeys];
                      arr.splice(idx, 1);
                      updateSettings({ openrouter_api_keys: arr } as any);
                    }}
                    style={{
                      padding: '6px 10px', borderRadius: '8px',
                      backgroundColor: '#fee2e2', color: '#dc2626',
                      border: '1px solid #fca5a5', fontSize: '12px',
                      cursor: 'pointer', fontWeight: 700,
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gemini API Key — always visible */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          padding: '16px', borderRadius: '8px',
          border: `1px solid ${settings.ai_provider === 'gemini' ? '#10b981' : '#e2e8f0'}`,
          backgroundColor: settings.ai_provider === 'gemini' ? '#f0fdf4' : '#fafafa',
          opacity: settings.ai_provider !== 'gemini' ? 0.6 : 1,
          transition: 'all 0.2s ease',
          marginTop: '24px'
        }}>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label" style={{ color: '#047857' }}>Google Gemini API Key</label>
            <input
              type="text"
              className="admin-input"
              value={settings.gemini_api_key || ''}
              onChange={(e) => updateSettings({ gemini_api_key: e.target.value })}
              placeholder="AIzaSy..."
              style={{ borderColor: settings.ai_provider === 'gemini' ? '#34d399' : undefined }}
            />
            <p style={{ fontSize: '12px', color: '#059669', marginTop: '8px', fontWeight: '500' }}>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Google AI Studio</a>'dan ücretsiz alabilirsiniz.{' '}
              {settings.gemini_api_key ? '✅ Key girilmiş' : ''}
            </p>
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label className="admin-label" style={{ color: '#047857' }}>Gemini Modeli</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="admin-select"
                value={settings.ai_provider === 'gemini' ? (settings.gemini_ai_model || settings.ai_model || '') : ''}
                onChange={(e) => updateSettings({ gemini_ai_model: e.target.value })}
                style={{ borderColor: settings.ai_provider === 'gemini' ? '#34d399' : undefined }}
                disabled={loadingModels || !settings.gemini_api_key || settings.ai_provider !== 'gemini'}
              >
                <option value="">-- Model Seçin --</option>
                {settings.ai_provider === 'gemini' && models.map(m => (
                  <option key={m.id} value={m.id}>
                    ✨ {m.name}
                  </option>
                ))}
              </select>
              {loadingModels && settings.ai_provider === 'gemini' && <Loader2 size={18} className="spin" style={{ color: '#10b981' }} />}
            </div>
          </div>
        </div>

        {/* Extra Gemini Keys (key rotation pool) */}
        {settings.ai_provider === 'gemini' && (
          <div style={{
            padding: '16px', borderRadius: '8px',
            border: '1px dashed #6ee7b7',
            backgroundColor: '#f0fdf4',
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#065f46' }}>🔄 Yedek Gemini Key'leri (Otomatik Rotasyon)</strong>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Birincil key 429 / kota hatası verirse sistem sıradaki key'i otomatik dener.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray((settings as any).gemini_api_keys) ? (settings as any).gemini_api_keys : [];
                  updateSettings({ gemini_api_keys: [...current, ''] } as any);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px',
                  backgroundColor: '#10b981', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                + Key Ekle
              </button>
            </div>

            {Array.isArray((settings as any).gemini_api_keys) && (settings as any).gemini_api_keys.length === 0 && (
              <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                Henüz yedek key eklenmedi. "Key Ekle" butonuyla birden fazla API key tanımlayabilirsiniz.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Array.isArray((settings as any).gemini_api_keys) ? (settings as any).gemini_api_keys : []).map((key: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', minWidth: '28px' }}>#{idx + 2}</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={key}
                    placeholder="AIzaSy..."
                    style={{ flex: 1, borderColor: '#6ee7b7', marginBottom: 0 }}
                    onChange={(e) => {
                      const currentKeys = Array.isArray((settings as any).gemini_api_keys) ? (settings as any).gemini_api_keys : [];
                      const arr = [...currentKeys];
                      arr[idx] = e.target.value;
                      updateSettings({ gemini_api_keys: arr } as any);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentKeys = Array.isArray((settings as any).gemini_api_keys) ? (settings as any).gemini_api_keys : [];
                      const arr = [...currentKeys];
                      arr.splice(idx, 1);
                      updateSettings({ gemini_api_keys: arr } as any);
                    }}
                    style={{
                      padding: '6px 10px', borderRadius: '8px',
                      backgroundColor: '#fee2e2', color: '#dc2626',
                      border: '1px solid #fca5a5', fontSize: '12px',
                      cursor: 'pointer', fontWeight: 700,
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>


      {/* System Prompts Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Sistem Promptları (Yönergeler)</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Yapay zekanın içerik üretirken uyacağı genel kurallar ve şablonları buradan yönetebilirsiniz.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* FAQ Generation Prompt */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899' }}></span>
              SSS (Sıkça Sorulan Sorular) Üretimi
            </h4>
            
            {/* Minimum FAQ Count */}
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label className="admin-label">
                Minimum SSS Sayısı
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
                  (AI her seferinde en az kaç soru oluşturmalı?)
                </span>
              </label>
              <input
                type="number"
                className="admin-input"
                min="1"
                max="20"
                value={settings.ai_faq_min_count || 8}
                onChange={(e) => updateSettings({ ai_faq_min_count: Math.max(1, Math.min(20, Number(e.target.value))) })}
                style={{ maxWidth: '200px' }}
              />
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>
                Önerilen: 8-12 arası. Daha fazla soru, daha kapsamlı SSS bölümü oluşturur.
              </p>
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">
                Sistem Yönergesi (Prompt)
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
                  (Boş bırakılırsa varsayılan prompt kullanılır)
                </span>
              </label>
              <textarea
                className="admin-textarea"
                rows={8}
                value={settings.ai_prompt_faq || ''}
                onChange={(e) => updateSettings({ ai_prompt_faq: e.target.value })}
                placeholder="Sen uzman bir SEO ve müşteri hizmetleri uzmanısın. Kullanıcıların Google'da en çok aradığı sorulara odaklanarak, hizmet hakkında teknik, detaylı ve SEO uyumlu SSS'ler oluştur..."
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '12px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  <strong>Kullanılabilir Değişkenler:</strong><br />
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'$'}{'{serviceTitle}'}</code> Hizmet adı<br/>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'$'}{'{serviceDescription}'}</code> Hizmet açıklaması<br/>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'$'}{'{companyName}'}</code> Firma adı<br/>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'$'}{'{targetCount}'}</code> Hedef soru sayısı
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 0 0' }}>
                  <strong>💡 İpucu:</strong> Prompt'ta <strong>"Google'da en çok aranan sorular"</strong>, <strong>"SEO uyumlu"</strong>, ve <strong>"HTML formatı"</strong> gibi anahtar kelimeleri kullanın. Varsayılan prompt zaten optimize edilmiştir.
                </p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span>
              pSEO (Bölgesel Sayfa) İçerik Üretimi
            </h4>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Sistem Yönergesi (Prompt)</label>
              <textarea
                className="admin-textarea"
                rows={5}
                value={settings.pseo_prompt_template || ''}
                onChange={(e) => updateSettings({ pseo_prompt_template: e.target.value })}
                placeholder="{city} ilinde {service} hizmeti için SEO uyumlu tanıtım yazısı..."
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '12px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  <strong>Kullanılabilir Değişkenler:</strong><br />
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'{city}'}</code> İl adı<br/>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'{service}'}</code> Hizmet adı<br/>
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{'{company}'}</code> Firma adı
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button 
          onClick={onSave} 
          disabled={saving} 
          className="admin-save-btn"
          style={{ width: 'auto', padding: '0 32px' }}
        >
          <Save size={20} />
          {saving ? 'Kaydediliyor...' : 'Yapay Zeka Ayarlarını Kaydet'}
        </button>
      </div>
    </div>
  );
}

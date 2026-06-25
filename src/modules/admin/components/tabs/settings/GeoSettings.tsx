'use client';

import { useState } from 'react';
import type { SiteSettings } from '@/core/types';
import { SettingsPanel, TextField, CheckboxField } from './SharedFields';
import { Sparkles, Globe, Shield, User, Loader2 } from 'lucide-react';

interface GeoSettingsProps {
  settings: SiteSettings;
  updateSetting: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  onUpdate: (data: SiteSettings) => void;
}

export default function GeoSettings({ settings, updateSetting, onUpdate }: GeoSettingsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    setLastAiResponse(null);
    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: settings.companyName || 'Şirketimiz', 
          type: 'geo' 
        })
      });
      const data = await res.json();
      setLastAiResponse(data);
      
      if (!res.ok) throw new Error(data.error || 'Hata oluştu');

      if (data.success && data.data) {
        const d = data.data;
        
        // Perform a single bulk update to avoid state race conditions
        onUpdate({
          ...settings,
          geo_know_about: d.geo_know_about || d.geo_knows_about || d.knows_about || d.expertise || settings.geo_know_about || '',
          geo_prompt_summary: d.geo_prompt_summary || d.prompt_summary || d.summary_instruction || settings.geo_prompt_summary || '',
          geo_prompt_faq: d.geo_prompt_faq || d.prompt_faq || d.faq_instruction || settings.geo_prompt_faq || '',
          geo_publishing_principles: d.geo_publishing_principles || d.publishing_principles || d.principles || settings.geo_publishing_principles || '',
          geo_founder_name: d.geo_founder_name || d.founder_name || d.founder || settings.geo_founder_name || '',
          geo_founder_same_as: d.geo_founder_same_as || d.founder_same_as || d.founder_url || settings.geo_founder_same_as || '',
          geo_org_same_as: (d.geo_org_same_as && Array.isArray(d.geo_org_same_as)) 
            ? d.geo_org_same_as 
            : (d.same_as && Array.isArray(d.same_as)) 
              ? d.same_as 
              : settings.geo_org_same_as || []
        });
        
        alert('GEO ayarları başarıyla analiz edildi ve dolduruldu. Lütfen kontrol edip kaydedin.');
      }


    } catch (err: any) {
      alert(`AI Analiz Hatası: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900">GEO (Generative Engine Optimization)</h3>
            <p className="text-sm text-blue-800/70 mt-1">
              Bu ayarlar, web sitenizin yapay zeka tabanlı arama motorları tarafından daha iyi anlaşılmasını sağlar.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              isGenerating 
                ? 'bg-blue-200 text-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sektör Analiz Ediliyor...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                AI ile Tüm GEO Ayarlarını Yapılandır
              </>
            )}
          </button>
          
          {lastAiResponse && (
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-blue-600 hover:underline text-center"
            >
              {showDebug ? 'Teknik Detayları Gizle' : 'Gelen AI Yanıtını Göster (Debug)'}
            </button>
          )}
        </div>
      </div>

      {showDebug && lastAiResponse && (
        <div className="mb-8 p-4 bg-black text-green-400 font-mono text-xs rounded-xl overflow-auto max-h-[400px]">
          <h4 className="text-white mb-2 font-bold border-b border-white/10 pb-2">RAW AI RESPONSE</h4>
          <pre>{JSON.stringify(lastAiResponse, null, 2)}</pre>
        </div>
      )}


      <SettingsPanel title="GEO Motoru Yapılandırması" fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <CheckboxField
              id="geo-enabled"
              label="GEO Katmanını Etkinleştir"
              checked={settings.geo_enabled ?? true}
              onChange={(value) => updateSetting('geo_enabled', value)}
            />
            <p className="text-xs text-black/40">Sayfalara AI motorları için özel JSON-LD varlık verileri ekler.</p>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel title="Kurumsal Kimlik ve Otorite (E-E-A-T)" fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-blue-600" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-black/60">Varlık İlişkileri</h4>
            </div>
            
            <TextField
              label="Uzmanlık Alanları (Virgülle ayırın)"
              placeholder="Örn: Hizmet Alanı 1, Danışmanlık 1..."
              value={settings.geo_know_about || ''}
              onChange={(value) => updateSetting('geo_know_about', value)}
            />
            
            <div className="space-y-2">
              <label className="admin-label">Resmi Sosyal/Entity Bağlantıları (SameAs)</label>
              <textarea
                className="admin-textarea"
                rows={4}
                placeholder="Her satıra bir URL (LinkedIn, Wikipedia, Twitter vb.)"
                value={settings.geo_org_same_as?.join('\n') || ''}
                onChange={(e) => updateSetting('geo_org_same_as', e.target.value.split('\n').filter(Boolean))}
              />
              <p className="text-xs text-black/40">AI motorlarının markanızı diğer platformlardaki profillerle eşleştirmesini sağlar.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-blue-600" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-black/60">Güven Sinyalleri</h4>
            </div>

            <TextField
              label="Yayın İlkeleri URL (Publishing Principles)"
              placeholder="https://siteniz.com/yayin-ilkelerimiz"
              value={settings.geo_publishing_principles || ''}
              onChange={(value) => updateSetting('geo_publishing_principles', value)}
            />

            <div className="p-4 bg-black/5 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-black/60" />
                <span className="font-bold text-xs uppercase text-black/60">Kurucu / Otorite Figürü</span>
              </div>
              
              <TextField
                label="İsim Soyisim"
                value={settings.geo_founder_name || ''}
                onChange={(value) => updateSetting('geo_founder_name', value)}
              />
              
              <TextField
                label="Profil URL (LinkedIn/Kişisel)"
                value={settings.geo_founder_same_as || ''}
                onChange={(value) => updateSetting('geo_founder_same_as', value)}
              />
            </div>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel title="GEO İçerik Motoru Promptları" fullWidth>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="admin-form-group">
            <label className="admin-label">AI Özet Üretim Talimatı</label>
            <textarea
              className="admin-textarea"
              rows={5}
              placeholder="Sayfa özeti için AI talimatı..."
              value={settings.geo_prompt_summary || ''}
              onChange={(e) => updateSetting('geo_prompt_summary', e.target.value)}
            />
            <p className="text-xs text-black/40 mt-2">LLM motorlarının sayfayı hızlıca "cite" etmesi için gereken özet yapısı.</p>
          </div>
        </div>
      </SettingsPanel>
    </div>
  );
}

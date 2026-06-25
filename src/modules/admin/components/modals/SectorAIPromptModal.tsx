'use client';

import { useState, useEffect } from 'react';
import { Settings, Sparkles, Save, X, Info, Box, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface SectorAIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PROMPT = `Sen "{{companyName}}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve AEO uzmanısın.
Görevin: Verilen iş sektörü için pSEO motorunda kullanılacak içerikleri üretmek.

Sektör: "{{sectorName}}"

ZORUNLU TALİMATLAR:
1. "description" metni ÇOK DETAYLI olmalı ve KESİNLİKLE EN AZ 800 KARAKTER uzunluğunda olmalıdır. Kısa yazma! Bu sektör için hangi zemin/yalıtım hizmetinin NEDEN kritik olduğunu detaylıca anlat.
2. "description" metni HTML formatında olmalı (<h2>, <h3>, <p>, <ul> gibi etiketler içermelidir).
3. "hero_description" alanına sektörün 1-2 cümlelik çok kısa özetini yaz.
4. "seo_title" (maks 60 karakter) ve "seo_description" (150-160 karakter civarı) alanlarını eksiksiz üret.
5. "recommended_service_ids" alanına, SADECE en altta listelenen hizmetlerden bu sektöre en uygun olanların ID'lerini tam sayı dizisi (array) olarak ekle.
6. "action_verb": Bu sektördeki uygulama için teknik bir eylem adı (Örn: Kaplama, Uygulama).
7. "service_suffix": Hizmet başlığının sonuna gelecek sektörel tamlama (Örn: Çözümleri, Sistemleri).
8. "value_prop": Sektöre özel bir değer önerisi (Örn: Hijyenik Standartlarda, Ağır Yüke Dayanıklı).

Sistemimizde bulunan aktif hizmetler (ID ve Başlık):
{{servicesList}}`;

const DEFAULT_JSON = `{
  "description": "<h2>...</h2><p>800+ karakterlik detaylı HTML metin...</p>",
  "hero_description": "Sektöre özel 1-2 cümlelik kısa özet.",
  "seo_title": "SEO Başlığı",
  "seo_description": "SEO Açıklaması",
  "recommended_service_ids": [1, 2],
  "action_verb": "Kaplama",
  "service_suffix": "Sistemleri",
  "value_prop": "Hijyenik Standartlarda"
}`;

const DEFAULT_FAQ_PROMPT = `Sen "{{companyName}}" firması için çalışan, alanında otorite kabul edilen, üst düzey bir SEO ve müşteri hizmetleri uzmanısın.
GÖREV: "{{sectorName}}" sektörü için en az {{targetCount}} adet profesyonel, SEO uyumlu ve kullanıcı odaklı Sıkça Sorulan Soru (SSS) oluştur.

Sektör: "{{sectorName}}"

GOOGLE ARAMA VERİLERİ ÖNCELİĞİ:
1. İnsanların Google'da en çok aradığı sektörel soru kalıplarına odaklan ("Bu sektöre özel epoksi neden gereklidir?", "Maliyeti nedir?", "Ne kadar sürer?").
2. Sorular SPESİFİK ve TEKNİK olmalı (genel sorular yerine bu sektöre özel sorular sor).
3. Cevaplar 2-3 cümle, HTML formatında olmalı ve sektör terimlerini içermelidir.
4. Her cevap <p> etiketi ile başlayıp bitmeli, <strong> ile vurgu yapılmalıdır.

YANIT FORMATI (KESİNLİKLE SADECE JSON ARRAY - Her cevap HTML formatında, tam cümle ve nokta ile bitmeli):
[
  {
    "question": "Teknik ve spesifik soru metni",
    "answer": "<p>Kısa, öz ve profesyonel cevap. <strong>Önemli vurgular</strong> için strong etiketi kullan.</p>"
  }
]`;

const DEFAULT_FAQ_JSON = `[
  {
    "question": "Soru 1",
    "answer": "<p>Cevap 1</p>"
  }
]`;

export default function SectorAIPromptModal({ isOpen, onClose }: SectorAIPromptModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'faq'>('content');
  
  const [prompt, setPrompt] = useState('');
  const [jsonSchema, setJsonSchema] = useState('');
  
  const [faqPrompt, setFaqPrompt] = useState('');
  const [faqJsonSchema, setFaqJsonSchema] = useState('');
  const [faqMinCount, setFaqMinCount] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || response;
        setPrompt(data.ai_prompt_sector_description || DEFAULT_PROMPT);
        setJsonSchema(data.ai_prompt_sector_json || DEFAULT_JSON);
        setFaqPrompt(data.ai_prompt_sector_faq || DEFAULT_FAQ_PROMPT);
        setFaqJsonSchema(data.ai_prompt_sector_faq_json || DEFAULT_FAQ_JSON);
        setFaqMinCount(typeof data.ai_sector_faq_min_count === 'number' ? data.ai_sector_faq_min_count : 3);
      }
    } catch (err) {
      console.error(err);
      toast.error('Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ai_prompt_sector_description: prompt,
        ai_prompt_sector_json: jsonSchema,
        ai_prompt_sector_faq: faqPrompt,
        ai_prompt_sector_faq_json: faqJsonSchema,
        ai_sector_faq_min_count: faqMinCount,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('AI Prompt ayarları kaydedildi.');
        onClose();
      } else {
        const body = await res.text().catch(() => '');
        console.error('[SectorAIPromptModal] Save failed:', res.status, body);
        toast.error(`Kaydedilirken hata oluştu (${res.status}).`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Sunucu hatası.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="admin-modal flex flex-col h-[90vh] w-full max-w-[800px] overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex-none flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Settings size={22} className="text-indigo-600" /> Sektör AI Şablonları
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-none px-6 border-b border-slate-200">
          <div className="flex gap-6 -mb-px">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              İçerik Şablonu
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'faq' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              SSS (Sıkça Sorulan Sorular) Şablonu
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4 shadow-sm" />
              <span className="font-medium animate-pulse">Ayarlar yükleniyor...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-5 flex gap-4 shadow-inner">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={24} />
                <div className="text-sm text-blue-900 leading-relaxed w-full">
                  <p className="font-bold mb-2 text-base text-blue-950">
                    {activeTab === 'content' ? 'İçerik Şablonu Kullanımı' : 'SSS Şablonu Kullanımı'}
                  </p>
                  
                  {activeTab === 'content' ? (
                    <>
                      <p className="mb-3">Sektör açıklamalarını AI ile doldururken kullanılacak komutu buradan özelleştirebilirsiniz.</p>
                      <div className="bg-white/60 p-3 rounded-xl border border-blue-100/50 mb-3">
                        <p className="font-bold text-blue-950 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-blue-500" />Kullanılabilir Değişkenler:</p>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{companyName}}`}</code> Firma adınız</li>
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{sectorName}}`}</code> Sektörün adı</li>
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{servicesList}}`}</code> Aktif hizmetler listesi</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-3">Sektöre özel Sıkça Sorulan Sorular üretilirken bu şablon kullanılır.</p>
                      <div className="bg-white/60 p-3 rounded-xl border border-blue-100/50 mb-3">
                        <p className="font-bold text-blue-950 mb-2 flex items-center gap-2"><MessageSquare size={16} className="text-blue-500" />Kullanılabilir Değişkenler:</p>
                        <ul className="list-disc list-inside space-y-1 ml-1">
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{companyName}}`}</code> Firma adınız</li>
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{sectorName}}`}</code> Sektörün adı</li>
                          <li><code className="bg-blue-100/50 text-blue-800 px-2 py-0.5 rounded-md font-mono text-xs font-bold">{`{{targetCount}}`}</code> Hedef soru sayısı (alttaki ayar)</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-4 p-4 bg-white rounded-xl border border-blue-100">
                        <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Minimum SSS Sayısı:</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={faqMinCount}
                          onChange={(e) => setFaqMinCount(parseInt(e.target.value) || 3)}
                          className="w-24 p-2 border border-slate-200 rounded-lg text-center font-bold"
                        />
                        <span className="text-xs text-slate-500">AI her üretimde en az bu kadar soru üretmeye çalışır.</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <Sparkles size={16} className="text-indigo-500" />
                    Sistem Komutu (System Prompt)
                  </label>
                  <textarea
                    value={activeTab === 'content' ? prompt : faqPrompt}
                    onChange={(e) => activeTab === 'content' ? setPrompt(e.target.value) : setFaqPrompt(e.target.value)}
                    className="w-full h-[250px] p-5 bg-white border border-slate-200/80 rounded-2xl font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm leading-relaxed"
                    placeholder="Sistem komutunu giriniz..."
                    spellCheck="false"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <Box size={16} className="text-emerald-500" />
                    JSON Çıktı Yapısı (Şema)
                  </label>
                  <textarea
                    value={activeTab === 'content' ? jsonSchema : faqJsonSchema}
                    onChange={(e) => activeTab === 'content' ? setJsonSchema(e.target.value) : setFaqJsonSchema(e.target.value)}
                    className="w-full h-[200px] p-5 bg-slate-900 border border-slate-700 text-emerald-400 rounded-2xl font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner leading-relaxed"
                    placeholder="JSON şemasını giriniz..."
                    spellCheck="false"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="flex-none flex justify-end gap-3 p-6 border-t border-slate-100 bg-white">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-all shadow-sm"
          >
            İptal
          </button>
          <button 
            onClick={saveSettings} 
            disabled={saving || loading}
            className="flex items-center gap-2.5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
          >
            {saving ? (
              <><div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</>
            ) : (
              <><Save size={18} strokeWidth={2.5} /> Ayarları Kaydet</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

interface ZeminCheckupConfigProps {
  tempConfig: any;
  setTempConfig: (config: any) => void;
}

export function ZeminCheckupConfig({ tempConfig, setTempConfig }: ZeminCheckupConfigProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'recommendations'>('steps');

  const steps = Array.isArray(tempConfig.steps) ? tempConfig.steps : [];
  const recommendations = Array.isArray(tempConfig.recommendations) ? tempConfig.recommendations : [];

  const updateSteps = (newSteps: any[]) => setTempConfig({ ...tempConfig, steps: newSteps });
  const updateRecommendations = (newRecs: any[]) => setTempConfig({ ...tempConfig, recommendations: newRecs });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        <button 
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${activeTab === 'steps' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('steps')}
        >
          Form Adımları
        </button>
        <button 
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${activeTab === 'recommendations' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Sonuç Kuralları
        </button>
      </div>

      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900">Analiz Adımları</h4>
              <p className="text-sm text-slate-500">Kullanıcıya sorulacak soruları ve seçenekleri belirleyin.</p>
            </div>
            <button
              onClick={() => updateSteps([...steps, { id: `step_${Date.now()}`, title: '', description: '', options: [] }])}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Plus size={16} /> Adım Ekle
            </button>
          </div>

          <div className="space-y-4">
            {steps.length === 0 && <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl">Henüz adım eklenmedi.</div>}
            {steps.map((step: any, sIdx: number) => (
              <div key={sIdx} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Adım ID (Zorunlu)</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        value={step.id} 
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].id = e.target.value;
                          updateSteps(newSteps);
                        }} 
                        placeholder="Örn: usage_type"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Soru Başlığı</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        value={step.title} 
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].title = e.target.value;
                          updateSteps(newSteps);
                        }} 
                        placeholder="Örn: Kullanım Amacı"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Açıklama</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        value={step.description} 
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].description = e.target.value;
                          updateSteps(newSteps);
                        }} 
                        placeholder="Örn: Alan ne amaçla kullanılacak?"
                      />
                    </div>
                  </div>
                  <button onClick={() => updateSteps(steps.filter((_: any, i: number) => i !== sIdx))} className="text-red-500 hover:bg-red-50 p-2 rounded-xl">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-700">Seçenekler</span>
                    <button
                      onClick={() => {
                        const newSteps = [...steps];
                        if (!Array.isArray(newSteps[sIdx].options)) newSteps[sIdx].options = [];
                        newSteps[sIdx].options.push({ id: '', label: '', iconName: 'CheckCircle2' });
                        updateSteps(newSteps);
                      }}
                      className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={14} /> Seçenek Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(!step.options || step.options.length === 0) && <div className="text-xs text-slate-400">Seçenek yok.</div>}
                    {(step.options || []).map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input className="w-1/3 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" placeholder="ID (örn: endustriyel)" value={opt.id} onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].options[oIdx].id = e.target.value;
                          updateSteps(newSteps);
                        }} />
                        <input className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" placeholder="Etiket (örn: Ağır Sanayi)" value={opt.label} onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].options[oIdx].label = e.target.value;
                          updateSteps(newSteps);
                        }} />
                        <input className="w-1/4 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" placeholder="İkon (örn: Factory)" value={opt.iconName} onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[sIdx].options[oIdx].iconName = e.target.value;
                          updateSteps(newSteps);
                        }} />
                        <button onClick={() => {
                          const newSteps = [...steps];
                          newSteps[sIdx].options = newSteps[sIdx].options.filter((_: any, i: number) => i !== oIdx);
                          updateSteps(newSteps);
                        }} className="text-red-400 hover:text-red-600 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900">Öneri Kuralları</h4>
              <p className="text-sm text-slate-500">Seçilen adım ID'leri ve seçenek ID'lerine göre verilecek hizmet önerilerini tanımlayın.</p>
            </div>
            <button
              onClick={() => updateRecommendations([...recommendations, { conditionStepId: '', conditionOptionId: '', serviceName: '', description: '', technicalSpecs: '', estimatedDurability: '' }])}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Plus size={16} /> Kural Ekle
            </button>
          </div>

          <div className="space-y-4">
            {recommendations.length === 0 && <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl">Henüz kural eklenmedi. (Son eklenen kural varsayılan (fallback) olarak sayılır).</div>}
            {recommendations.map((rec: any, rIdx: number) => (
              <div key={rIdx} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl w-full border border-indigo-100">
                    <span className="text-sm font-black text-indigo-900">KURAL:</span>
                    <span className="text-sm font-medium text-indigo-700">Eğer</span>
                    <input className="border border-indigo-200 rounded-lg px-2 py-1 text-sm w-32 outline-none" placeholder="Adım ID" value={rec.conditionStepId} onChange={(e) => {
                      const newRecs = [...recommendations];
                      newRecs[rIdx].conditionStepId = e.target.value;
                      updateRecommendations(newRecs);
                    }} />
                    <span className="text-sm font-medium text-indigo-700">eşitse</span>
                    <input className="border border-indigo-200 rounded-lg px-2 py-1 text-sm w-32 outline-none" placeholder="Seçenek ID" value={rec.conditionOptionId} onChange={(e) => {
                      const newRecs = [...recommendations];
                      newRecs[rIdx].conditionOptionId = e.target.value;
                      updateRecommendations(newRecs);
                    }} />
                    <span className="text-xs text-indigo-500 italic ml-2">(Boş bırakılırsa her zaman geçerli varsayılan kural olur)</span>
                  </div>
                  <button onClick={() => updateRecommendations(recommendations.filter((_: any, i: number) => i !== rIdx))} className="text-red-500 hover:bg-red-50 p-2 rounded-xl">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Önerilen Hizmet Adı</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      value={rec.serviceName} 
                      onChange={(e) => {
                        const newRecs = [...recommendations];
                        newRecs[rIdx].serviceName = e.target.value;
                        updateRecommendations(newRecs);
                      }} 
                      placeholder="Örn: Self-Leveling Epoksi"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dayanıklılık Süresi</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      value={rec.estimatedDurability} 
                      onChange={(e) => {
                        const newRecs = [...recommendations];
                        newRecs[rIdx].estimatedDurability = e.target.value;
                        updateRecommendations(newRecs);
                      }} 
                      placeholder="Örn: 10-15 Yıl"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Açıklama</label>
                    <textarea 
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      value={rec.description} 
                      onChange={(e) => {
                        const newRecs = [...recommendations];
                        newRecs[rIdx].description = e.target.value;
                        updateRecommendations(newRecs);
                      }} 
                      placeholder="Önerilen sistemin kısa açıklaması"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Teknik Özellikler (Virgülle ayırın)</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                      value={Array.isArray(rec.technicalSpecs) ? rec.technicalSpecs.join(', ') : rec.technicalSpecs} 
                      onChange={(e) => {
                        const newRecs = [...recommendations];
                        // Convert comma separated string to array
                        newRecs[rIdx].technicalSpecs = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                        updateRecommendations(newRecs);
                      }} 
                      placeholder="Örn: Yüksek Darbe Dayanımı, Anti-Tozlanma Yüzey"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

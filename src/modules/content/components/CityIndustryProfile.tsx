/**
 * City Industry Profile Component
 * 
 * Displays AI-generated industry analysis for a specific city
 * Part of PHASE 3: Content Differentiation & E-E-A-T Enhancement
 */

interface CityIndustryProfileProps {
  profile: {
    cityName: string;
    dominantSectors: Array<{
      name: string;
      percentage: number;
      projectCount: number;
    }>;
    typicalNeeds: string[];
    recommendedSystems: string[];
    localChallenges: string[];
    floorRequirements: {
      heavyTraffic: boolean;
      chemicalResistance: boolean;
      hygiene: boolean;
      dustControl: boolean;
    };
    analysisText: string | null;
  };
  className?: string;
}

export function CityIndustryProfile({ profile, className = '' }: CityIndustryProfileProps) {
  // Don't render if no meaningful data
  if (profile.dominantSectors.length === 0 && !profile.analysisText) {
    return null;
  }

  return (
    <section className={`city-industry-profile ${className}`}>
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              📊 {profile.cityName} Endüstriyel Zemin Profili
            </h2>
            <p className="text-slate-600 text-sm">
              Gerçek proje verileri ve bölge analizi ile hazırlanmıştır
            </p>
          </div>

          {/* Profile Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            
            {/* Dominant Sectors */}
            {profile.dominantSectors.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🏭</span>
                  Baskın Sektörler
                </h3>
                <div className="space-y-2">
                  {profile.dominantSectors.map((sector, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-700 text-sm">{sector.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          %{sector.percentage}
                        </div>
                        <span className="text-slate-500 text-xs">
                          ({sector.projectCount} proje)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Requirements */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                Zemin Gereksinimleri
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.floorRequirements.heavyTraffic && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-700">Ağır Trafik</span>
                  </div>
                )}
                {profile.floorRequirements.chemicalResistance && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-700">Kimyasal Direnç</span>
                  </div>
                )}
                {profile.floorRequirements.hygiene && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-700">Hijyen</span>
                  </div>
                )}
                {profile.floorRequirements.dustControl && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-700">Toz Kontrolü</span>
                  </div>
                )}
              </div>
              
              {/* Typical Needs */}
              {profile.typicalNeeds.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-600 mb-2 font-medium">Tipik İhtiyaçlar:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.typicalNeeds.map((need, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommended Systems */}
            {profile.recommendedSystems.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Önerilen Sistemler
                </h3>
                <ul className="space-y-2">
                  {profile.recommendedSystems.map((system, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <span className="text-slate-700">{system}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Local Challenges */}
            {profile.localChallenges.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Bölgesel Zorluklar
                </h3>
                <ul className="space-y-2">
                  {profile.localChallenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">●</span>
                      <span className="text-slate-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI-Generated Analysis */}
          {profile.analysisText && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Uzman Analizi
              </h3>
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                {profile.analysisText.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p key={idx} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Data Source Badge */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              💡 Bu analiz gerçek proje verilerimiz, OSB bilgileri ve iklim koşulları baz alınarak hazırlanmıştır
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

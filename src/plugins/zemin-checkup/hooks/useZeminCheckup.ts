"use client";

import { useState, useMemo } from 'react';
import { useSettings } from '@/modules/settings/context/SettingsContext';

interface CheckupOption {
  id: string;
  label: string;
  iconName: string;
}

interface CheckupStep {
  id: string;
  title: string;
  description: string;
  options: CheckupOption[];
}

export interface Recommendation {
  serviceName: string;
  description: string;
  technicalSpecs: string[];
  estimatedDurability: string;
}

const defaultSteps: CheckupStep[] = [
  {
    id: 'surface',
    title: 'Mevcut Zemin Tipi',
    description: 'Uygulama yapılacak alanın şu anki durumu nedir?',
    options: [
      { id: 'concrete', label: 'Ham Beton', iconName: 'Factory' },
      { id: 'old_epoxy', label: 'Eski Epoksi / Boya', iconName: 'Zap' },
      { id: 'ceramic', label: 'Seramik / Karo', iconName: 'CheckCircle2' },
      { id: 'damaged', label: 'Hasarlı / Çatlak Zemin', iconName: 'AlertCircle' },
    ]
  },
  {
    id: 'usage',
    title: 'Kullanım Amacı',
    description: 'Alan ne amaçla kullanılacak?',
    options: [
      { id: 'industrial', label: 'Ağır Sanayi / Forklift', iconName: 'HardHat' },
      { id: 'food', label: 'Gıda / Hijyenik Alan', iconName: 'Droplets' },
      { id: 'commercial', label: 'Mağaza / Ofis', iconName: 'Factory' },
      { id: 'parking', label: 'Otopark / Garaj', iconName: 'Zap' },
    ]
  },
  {
    id: 'condition',
    title: 'Özel Koşullar',
    description: 'Zeminde karşılaşılan özel bir durum var mı?',
    options: [
      { id: 'moisture', label: 'Yüksek Nem / Rutubet', iconName: 'Droplets' },
      { id: 'chemical', label: 'Kimyasal Temas', iconName: 'AlertCircle' },
      { id: 'aesthetic', label: 'Dekoratif Görünüm', iconName: 'Zap' },
      { id: 'none', label: 'Standart Koşullar', iconName: 'CheckCircle2' },
    ]
  }
];

export function useZeminCheckup() {
  const { settings } = useSettings();
  const phone = settings?.phone || '0850 000 00 00';
  
  const content = settings?.uiContent?.checkupWidget || ({} as any);
  const pluginConfig = settings?.plugin_configs?.['zemin-checkup'] || {};
  
  const stepsToUse = Array.isArray(pluginConfig.steps) && pluginConfig.steps.length > 0 ? pluginConfig.steps : defaultSteps;

  const uiTexts = {
    title: content.title || 'Hızlı Zemin Analizi',
    subtitle: content.subtitle || 'Sektörünüze ve ihtiyaçlarınıza en uygun epoksi zemin kaplama çözümünü sadece 3 adımda belirleyin.',
    buttonText: content.buttonText || 'Analizi Başlat',
    resultTitle: content.resultTitle || 'Analiz Sonucu ve Raporunuz',
    resultSubtitle: content.resultSubtitle || 'Seçimlerinize dayanarak sizin için en ideal zemin sistemini belirledik.',
    resultFeature1: content.resultFeature1 || 'Özel Teknik Şartname',
    resultFeature2: content.resultFeature2 || 'Maliyet Optimizasyonu',
    resultFeature3: content.resultFeature3 || 'Hızlı Uygulama Planı',
    resultCtaText: content.resultCtaText || 'Teklif Al ve Keşif Randevusu Oluştur'
  };

  const [currentStep, setCurrentStep] = useState(-1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [analizId, setAnalizId] = useState<number>(0);

  const handleStart = () => {
    setCurrentStep(0);
    setSelections({});
    setIsCompleted(false);
    setAnalizId(0);
  };

  const handleSelect = (stepId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [stepId]: optionId }));
    
    if (currentStep < stepsToUse.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      setAnalizId(Math.floor(Math.random() * 9000) + 1000);
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    } else {
      setCurrentStep(-1);
    }
  };

  const recommendation = useMemo((): Recommendation | null => {
    if (!isCompleted) return null;

    const rules = Array.isArray(pluginConfig.recommendations) && pluginConfig.recommendations.length > 0 
      ? pluginConfig.recommendations 
      : [];

    if (rules.length > 0) {
      // Find matching rule
      let matchedRule = null;
      let defaultRule = null;
      for (const rule of rules) {
        if (!rule.conditionStepId && !rule.conditionOptionId) {
          defaultRule = rule;
        } else if (selections[rule.conditionStepId] === rule.conditionOptionId) {
          matchedRule = rule;
          break; // First match wins
        }
      }
      
      const result = matchedRule || defaultRule;
      if (result) {
        return {
          serviceName: result.serviceName,
          description: result.description,
          technicalSpecs: Array.isArray(result.technicalSpecs) ? result.technicalSpecs : [],
          estimatedDurability: result.estimatedDurability
        };
      }
    }

    // Fallback original logic
    const { usage, condition } = selections;

    if (condition === 'moisture') {
      return {
        serviceName: 'Nem Bariyerli Epoksi Sistemi',
        description: 'Zemindeki yüksek nem oranına karşı özel nem toleranslı astar ve difüzyon açık kaplama sistemi.',
        technicalSpecs: ['Nem Toleranslı Astar', 'Gözle Görülmeyen Rutubet Bariyeri', 'Kabarma Karşıtı Teknoloji'],
        estimatedDurability: '10-15 Yıl'
      };
    }

    if (usage === 'industrial') {
      return {
        serviceName: 'Self-Leveling Endüstriyel Epoksi',
        description: 'Ağır yük ve forklift trafiğine dayanıklı, pürüzsüz ve yüksek mekanik dirençli kaplama.',
        technicalSpecs: ['Yüksek Darbe Dayanımı', 'Anti-Tozlanma Yüzey', 'Kolay Temizlenebilir'],
        estimatedDurability: '15+ Yıl'
      };
    }

    if (usage === 'food') {
      return {
        serviceName: 'Antibakteriyel Poliüretan Beton',
        description: 'Gıda güvenliği standartlarına uygun, bakteri üremesini engelleyen ve ısı şoklarına dayanıklı sistem.',
        technicalSpecs: ['HACCP Uyumlu', 'Anti-Mikrobiyal Yüzey', 'Isı ve Kimyasal Direnç'],
        estimatedDurability: '12-15 Yıl'
      };
    }

    if (usage === 'parking') {
      return {
        serviceName: 'Otopark Çok Katmanlı Kaplama (Deck)',
        description: 'Yoğun araç trafiğine ve lastik sürtünmelerine dayanıklı, kaymaz yüzeyli otopark sistemi.',
        technicalSpecs: ['Kaymaz (Anti-Slip) Yüzey', 'UV Dayanımlı Son Kat', 'Lastik İzi Bırakmaz'],
        estimatedDurability: '8-12 Yıl'
      };
    }

    if (condition === 'aesthetic' || usage === 'commercial') {
      return {
        serviceName: 'Dekoratif Metalik / 3D Epoksi',
        description: 'Mağaza ve ofisler için şık, estetik değeri yüksek ve tamamen eksiz dekoratif kaplama.',
        technicalSpecs: ['Sonsuz Renk Seçeneği', 'Eksiz ve Derzsiz', 'Yüksek Parlaklık'],
        estimatedDurability: '10-12 Yıl'
      };
    }

    return {
      serviceName: 'Standart Multilayer Epoksi Kaplama',
      description: 'Her türlü zemine uygun, ekonomik ve uzun ömürlü genel amaçlı epoksi sistemi.',
      technicalSpecs: ['Ekonomik Çözüm', 'Hızlı Uygulama', 'Standart Kimyasal Direnç'],
      estimatedDurability: '10+ Yıl'
    };
  }, [isCompleted, selections, pluginConfig.recommendations]);

  return {
    steps: stepsToUse,
    uiTexts,
    phone,
    currentStep,
    selections,
    isCompleted,
    recommendation,
    analizId,
    handleStart,
    handleSelect,
    handleBack
  };
}

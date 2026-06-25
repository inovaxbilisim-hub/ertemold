import { HookRegistry } from '@/core/hooks/HookRegistry';
import type { Service } from '@/core/types';

function initPlugin() {
  const timelineCallback = (stages: TimelineStage[], context: { reference: any; service?: Service | null; settings?: any }) => {
    const config = context.settings?.plugin_configs?.['project-timeline'] || {};

    // Currently this plugin does not transform the default timeline structure,
    // but it registers a dedicated timeline hook so future enhancements
    // or other extensions can modify stages here safely.
    if (config.default_view === 'horizontal') {
      return stages.map(stage => ({
        ...stage,
        ui_view: 'horizontal'
      }));
    }

    return stages;
  };

  HookRegistry.addFilter('pseo:build-blocks', timelineCallback, 10);
  HookRegistry.addFilter('reference_timeline', timelineCallback, 10);
}

export interface TimelineStage {
  day: number;
  title: string;
  description: string;
  icon: string;
}

// ─── Yardımcı: sistem tipini normalize et ─────────────────────────────────────
function detectSystemCategory(systemType: string, applicationType?: string | null): string {
  const s = (systemType + ' ' + (applicationType || '')).toLowerCase();

  if (s.includes('polyurea') || s.includes('poliürea') || s.includes('poli̇ürea')) return 'polyurea';
  if (s.includes('poliüretan') || s.includes('polyurethane')) return 'polyurethane';
  if (s.includes('pu köpük') || s.includes('pu köpük') || s.includes('köpük')) return 'pu_foam';
  if (s.includes('multilayer') || s.includes('multi-layer') || s.includes('çok katmanlı') || s.includes('katmanlı epoksi')) return 'multilayer_epoxy';
  if (s.includes('antistatic') || s.includes('antistatik') || s.includes('esd')) return 'antistatic_epoxy';
  if (s.includes('anti-slip') || s.includes('kaymaz') || s.includes('quartz') || s.includes('kuvars')) return 'quartz_epoxy';
  if (s.includes('self leveling') || s.includes('self-leveling') || s.includes('kendinden') || s.includes('sl epoksi')) return 'sl_epoxy';
  if (s.includes('waterproof') || s.includes('su izolasyon') || s.includes('su yalıtım') || s.includes('terasa')) return 'waterproofing';
  if (s.includes('mortar') || s.includes('epoksi şap') || s.includes('endüstriyel şap')) return 'epoxy_mortar';
  if (s.includes('mertekane') || s.includes('koridor') || s.includes('yatay') && s.includes('bariyer')) return 'joint_injection';
  if (s.includes('epoksi')) return 'epoxy'; // generic epoxy fallback

  return 'epoxy'; // ultimate fallback
}

// ─── Aşama üreticileri (sistem tipine göre) ───────────────────────────────────

function stagePrep(moisture: boolean, thickness?: number | null): TimelineStage {
  return {
    day: 1,
    title: 'Mekanik Hazırlık & Shot Blasting',
    description: moisture
      ? `Yüksek nem içeren beton yüzey, elmas uçlu yüzey frezeleme ve Shot Blasting ile mekanik olarak aşındırıldı; tüm zayıf katmanlar, kirlilik ve yağ izleri uzaklaştırılarak yüzey tozsuzlaştırıldı.`
      : `Mevcut beton yüzey elmas uçlu makineler ve Shot Blasting ile mekanik olarak aşındırıldı, zayıf katmanlar temizlendi${thickness ? `, zemin ${thickness} mm uygulama için hazır hale getirildi` : ''} ve tozsuzlaştırma yapıldı.`,
    icon: 'HardHat',
  };
}

function stagePrimer(moisture: boolean): TimelineStage {
  return {
    day: 2,
    title: moisture ? 'Nem Bariyeri & Özel Astar Serimi' : 'Aderans Artırıcı Epoksi Astar',
    description: moisture
      ? 'Zemindeki yüksek nem oranı sebebiyle nem toleranslı (moisture-tolerant) özel astarlar kullanılarak nem bariyeri oluşturuldu; aderans sağlayan solvent içermeyen epoksi astar beton gözeneklerine nüfuz ettirildi.'
      : 'Beton gözeneklerini doldurmak ve zemin ile kaplama arasında maksimum aderans sağlamak için solvent içermeyen, düşük viskoziteli epoksi astar uygulandı.',
    icon: moisture ? 'Droplets' : 'Layers',
  };
}

// ─── Sistem bazlı tam timeline oluşturucu ─────────────────────────────────────

function buildMultilayerEpoxy(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const thickness = ref.coating_thickness_mm;
  const curing = ref.curing_time_hours || 24;
  return [
    stagePrep(isMoisture, thickness),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Taşıyıcı Katman (Body Coat) Uygulaması',
      description: `Yüksek dolgu oranına sahip orta viskoziteli epoksi gövde katmanı${thickness ? ` (toplam ${thickness} mm kalınlık hedefi)` : ''} çekilerek zemine teraziye alındı; kabarcık ve hava boşlukları merdane ile giderildi.`,
      icon: 'Layers',
    },
    {
      day: 4,
      title: 'Self Leveling Bitiş Katmanı',
      description: 'Pürüzsüz, parlak ve hijyen standartlarına (HACCP) uygun solvent içermeyen self-leveling epoksi son kat çekildi; her köşe ve kenar detayı elle fırçayla tamamlandı.',
      icon: 'Sparkles',
    },
    {
      day: 5,
      title: `Tam Kürlenme (${curing} Saat) & Kalite Kontrol`,
      description: `${curing} saatlik kimyasal kürlenme periyodunun ardından sertlik ölçümü, yapışma testi (pull-off) ve görsel kalite kontrol yapıldı; zemin trafiğe teslim edildi.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildSLEpoxy(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 24;
  return [
    stagePrep(isMoisture, ref.coating_thickness_mm),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Çatlak & Derzlerin Epoksi Macunla Tamiri',
      description: 'Yüzeydeki çatlaklar, derzler ve oyuklar özel tixotropik epoksi macunla dolduruldu; sertleşme sonrası zımpara ile tesviye edildi.',
      icon: 'Settings',
    },
    {
      day: 4,
      title: 'Self Leveling Epoksi Son Kat Serimi',
      description: 'Tamamen pürüzsüz, parlak ve hijyen standartlarına (HACCP) uygun solvent içermeyen epoksi son kat dökümü yapıldı; dişli merdane ile kabarcıklar alındı.',
      icon: 'Sparkles',
    },
    {
      day: 5,
      title: `Tam Kürlenme & Teslim`,
      description: `${curing} saatlik kimyasal kürlenme sonrasında tüm dayanım testleri yapılarak alan trafiğe açıldı.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildQuartzEpoxy(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 24;
  const hasForklift = !!(ref.forklift_traffic);
  return [
    stagePrep(isMoisture, ref.coating_thickness_mm),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Kuvars Kumu Saçımı & Gövde Katmanı',
      description: `Epoksi gövde katmanı üzerine tam doygunluk (full broadcast) kuvars kumu saçıldı; yüzeyde kaymaz doku${hasForklift ? ' ve forklift yükü altında dayanıklılık' : ''} sağlandı.`,
      icon: 'Layers',
    },
    {
      day: 4,
      title: 'Mühürleme & Koruyucu Son Kat',
      description: 'Kuvars yüzeyinin üzeri aşınma ve kimyasal dayanımı artırmak için şeffaf epoksi mühürleme katmanı ile kapatıldı.',
      icon: 'Settings',
    },
    {
      day: 5,
      title: `Kürlenme & Teslim`,
      description: `${curing} saatlik kürlenme sonrası kaymaz zemin slip-resistance testi ile doğrulandı ve alan teslim edildi.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildAntistaticEpoxy(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 24;
  return [
    stagePrep(isMoisture, ref.coating_thickness_mm),
    {
      day: 2,
      title: 'Topraklama Teli & Izgara Hattı Döşenmesi',
      description: 'ESD (Electrostatic Discharge) koruma sistemi için bakır şerit topraklama teli 3×3 m ızgara formatında zemine serilerek elektrik topraklamasına bağlandı.',
      icon: 'Zap',
    },
    stagePrimer(isMoisture),
    {
      day: 4,
      title: 'Antistatik (ESD) Epoksi Son Kat',
      description: 'IEC 61340-5-1 standardına uygun, iletken katkılı antistatik epoksi son kat uygulandı; yüzey direnci < 10⁸ Ω hedef değerine göre denetlendi.',
      icon: 'Sparkles',
    },
    {
      day: 5,
      title: `ESD Testi & Sertifikasyon`,
      description: `${curing} saatlik kürlenme sonrası yüzey direnci ölçümü yapıldı; zemin uluslararası ESD standartlarına uygunluk belgesi ile teslim edildi.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildPolyurea(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 2;
  return [
    stagePrep(isMoisture, ref.coating_thickness_mm),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Yüzey Profil & Son Kontrol',
      description: 'Shot Blasting sonrası yüzey pürüzlülüğü (CSP 3-4) kontrol edildi; toz ve nem ölçümü yapılarak poliürea uygulama şartları onaylandı.',
      icon: 'Settings',
    },
    {
      day: 4,
      title: 'Mobil Reaktörle Sıcak Sprey Poliürea',
      description: "80 °C'de iki bileşenli çarpışmalı karışım yöntemiyle sprey uygulanan poliürea, saniyeler içinde jelleşerek ek yersiz, elastik bir membran oluşturdu.",
      icon: 'Zap',
    },
    {
      day: 5,
      title: `Alifatik UV Kat & Teslim (${curing} Saat Kürlenme)`,
      description: `Güneş ışınlarına dayanımlı alifatik poliüretan son kat UV koruma için uygulandı. ${curing} saatlik hızlı kürlenme sonrası zemin yayalar ve araç trafiğine açıldı.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildPolyurethane(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 48;
  const hasForklift = !!(ref.forklift_traffic);
  return [
    stagePrep(isMoisture, ref.coating_thickness_mm),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Çatlak Tamiri & Tesviye',
      description: 'Yüzeydeki tüm çatlaklar ve oyuklar poliüretan esaslı macunla tampon; zemin teraziye alındı.',
      icon: 'Settings',
    },
    {
      day: 4,
      title: `Esnek Poliüretan Kaplama${hasForklift ? ' (Yük Altında Dayanımlı)' : ''}`,
      description: `Aşınma ve darbelere yüksek dayanımlı${hasForklift ? ', forklift trafiği sertifikalı' : ''} esnek poliüretan gövde ve mat koruyucu son kat vernik uygulandı.`,
      icon: 'Layers',
    },
    {
      day: 5,
      title: `Kürlenme (${curing} Saat) & Kullanıma Açılış`,
      description: `${curing} saatlik tam kürlenme periyodu tamamlandıktan sonra zemin yaya ve ağır araç trafiğine açıldı.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildWaterproofing(ref: any): TimelineStage[] {
  const curing = ref.curing_time_hours || 72;
  return [
    {
      day: 1,
      title: 'Yüzey Hazırlığı & Tamir',
      description: 'Mevcut yüzey temizlendi; çatlaklar, boşluklar ve bozulmuş alanlar poliüretan su yalıtım macunuyla tamir edilerek kuruması beklendi.',
      icon: 'HardHat',
    },
    {
      day: 2,
      title: 'Detay Su Yalıtımı (Derz & Köşeler)',
      description: 'Bina detaylarında (derz, köşe, boru geçişleri) yoğunlaştırılmış su yalıtım uygulaması yapıldı; polyester kumaş ile güçlendirme şeridi eklendi.',
      icon: 'Droplets',
    },
    {
      day: 3,
      title: '1. Su Yalıtım Membranı Katmanı',
      description: 'Sıcak veya soğuk uygulamalı su yalıtım membranının ilk katı tüm alana serilerek eşit kalınlık sağlandı.',
      icon: 'Layers',
    },
    {
      day: 4,
      title: '2. Katman & Koruyucu Kaplama',
      description: 'İkinci membran katmanı enine bindirme (overlap) ile uygulandı; UV ve mekanik hasara karşı koruyucu kaplama serilerek sistem tamamlandı.',
      icon: 'Settings',
    },
    {
      day: 5,
      title: `Su Testi & Teslim (${curing} Saat)`,
      description: `${curing} saatlik kürlenme sonrası 48 saatlik su birikme testi (ponding test) yapıldı; sızıntı gözlemlenmeden sistem teslim edildi.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildEpoxyMortar(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 24;
  const thickness = ref.coating_thickness_mm;
  return [
    stagePrep(isMoisture, thickness),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: `Epoksi Mortar Uygulaması${thickness ? ` (${thickness} mm)` : ''}`,
      description: `Yüksek mekanik dayanımlı agrega takviyeli epoksi harç${thickness ? ` ${thickness} mm kalınlığında` : ''} yüzeye serildi; tırtıllı merdane ile sıkıştırılarak boşluksuz bir yapı elde edildi.`,
      icon: 'Layers',
    },
    {
      day: 4,
      title: 'Yüzey Düzeltme & Bitiş Katmanı',
      description: 'Mortar yüzeyi zımparalanarak düzleştirildi; bağ kesmemek için kimyasal aderansa dayalı bitiş epoksi katmanı uygulandı.',
      icon: 'Settings',
    },
    {
      day: 5,
      title: `Kürlenme & Yük Testi`,
      description: `${curing} saatlik kürlenme sonrası sertlik ve pull-off yapışma testi ile zemin dayanımı doğrulandı; alan ağır ekipman trafiğine açıldı.`,
      icon: 'CheckCircle2',
    },
  ];
}

function buildGenericEpoxy(ref: any): TimelineStage[] {
  const isMoisture = !!ref.moisture_problem;
  const curing = ref.curing_time_hours || 24;
  const thickness = ref.coating_thickness_mm;
  return [
    stagePrep(isMoisture, thickness),
    stagePrimer(isMoisture),
    {
      day: 3,
      title: 'Çatlak Tamiratı & Tesviye Katmanı',
      description: 'Yüzeydeki çatlaklar, derzler ve oyuklar epoksi macunla dolduruldu. Tüm zemine dolgulu gövde katmanı uygulanarak teraziye alındı.',
      icon: 'Settings',
    },
    {
      day: 4,
      title: 'Epoksi Son Kat Serimi',
      description: `${ref.system_type ? ref.system_type + ' sistemi' : 'Epoksi'} son kat uygulaması pürüzsüz ve hijyen standartlarına uygun biçimde tamamlandı.`,
      icon: 'Sparkles',
    },
    {
      day: 5,
      title: `Tam Kürlenme (${curing} Saat) & Teslim`,
      description: `${curing} saatlik kimyasal kürlenme sonrasında tüm dayanım testleri yapılarak alan trafiğe açıldı.`,
      icon: 'CheckCircle2',
    },
  ];
}

// ─── Ana export ─────────────────────────────────────────────────────────────────

export function generateTimeline(
  reference: any,
  service?: Service | null
): TimelineStage[] {
  // 1. Hizmetin DB'den gelmiş timeline_stages varsa — direkt kullan
  if (service?.timeline_stages && service.timeline_stages.length > 0) {
    return service.timeline_stages;
  }

  // 2. Hizmetin tanımlı timeline'ı yoksa → referans verilerinden otomatik üret
  const category = detectSystemCategory(
    reference.system_type || '',
    reference.application_type
  );

  switch (category) {
    case 'multilayer_epoxy': return buildMultilayerEpoxy(reference);
    case 'sl_epoxy':        return buildSLEpoxy(reference);
    case 'quartz_epoxy':    return buildQuartzEpoxy(reference);
    case 'antistatic_epoxy': return buildAntistaticEpoxy(reference);
    case 'polyurea':        return buildPolyurea(reference);
    case 'polyurethane':    return buildPolyurethane(reference);
    case 'waterproofing':   return buildWaterproofing(reference);
    case 'epoxy_mortar':    return buildEpoxyMortar(reference);
    default:                return buildGenericEpoxy(reference);
  }
}

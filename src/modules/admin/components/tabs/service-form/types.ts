import type { Service, ServiceCategory, SiteSettings } from '@/core/types';

export interface ServiceFormProps {
  item: Partial<Service>;
  categories: ServiceCategory[];
  sectors?: any[];
  settings?: SiteSettings | null;
  onUpdate: (item: Partial<Service>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (path: string) => void) => void;
}

export type ServiceFormTab = 'general' | 'content' | 'seo' | 'faq' | 'advanced';

export const SERVICE_COLOR_OPTIONS = [
  { value: 'teal',   label: 'Turkuaz', class: 'badge-green'   },
  { value: 'blue',   label: 'Mavi',    class: 'badge-blue'    },
  { value: 'orange', label: 'Turuncu', class: 'badge-orange'  },
  { value: 'purple', label: 'Mor',     class: 'badge-purple'  },
  { value: 'red',    label: 'Kırmızı', class: 'badge-red'     },
  { value: 'green',  label: 'Yeşil',   class: 'badge-success' },
  { value: 'indigo', label: 'Lacivert',class: 'badge-indigo'  },
  { value: 'rose',   label: 'Gül',     class: 'badge-rose'    },
  { value: 'amber',  label: 'Sarı',    class: 'badge-orange'  },
];

export const TIMELINE_ICON_OPTIONS = [
  { value: 'HardHat',      label: 'Kask (Hazırlık)' },
  { value: 'Droplets',     label: 'Damla (Nem)' },
  { value: 'Layers',       label: 'Katmanlar (Astar)' },
  { value: 'Settings',     label: 'Dişli (Teknik)' },
  { value: 'Zap',          label: 'Şimşek (Hızlı)' },
  { value: 'Sparkles',     label: 'Pırıltı (Son Kat)' },
  { value: 'CheckCircle2', label: 'Onay (Teslim)' },
];

export interface ServiceFaqItem {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
}

interface TimelineStageItem {
  day: number;
  title: string;
  description: string;
  icon: string;
}

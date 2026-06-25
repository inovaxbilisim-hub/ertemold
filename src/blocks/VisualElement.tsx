'use client';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Award, Truck, MapPin, Zap, Globe, Sparkles, Activity } from 'lucide-react';

const iconMap: Record<string, any> = {
  Shield, CheckCircle2, Award, Truck, MapPin, Zap, Globe, Sparkles, Activity,
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BadgesVisual = ({ data }: { data?: Record<string, any> }) => {
  const badges = data?.badges || [
    { icon: Shield, label: 'Garantili Uygulama', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Award, label: 'ISO Sertifikalı', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: CheckCircle2, label: 'HACCP Uyumlu', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: Sparkles, label: 'Premium İşçilik', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 gap-4 h-full content-center"
    >
      {badges.map((badge: Record<string, any>, idx: number) => {
        const Icon = typeof badge.icon === 'string' ? (iconMap[badge.icon] || Shield) : (badge.icon || Shield);
        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={`p-6 rounded-[32px] ${badge.bg || 'bg-white'} border border-black/5 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all group`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.color || 'text-blue-600'} bg-white shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-black/80">{badge.label}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const GlassMapVisual = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="relative h-full flex items-center justify-center"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-400/5 rounded-[40px]" />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="absolute w-64 h-64 border-2 border-blue-600/20 rounded-full"
    />
    <div className="relative z-10 p-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] shadow-2xl flex flex-col items-center text-center gap-6 max-w-[300px]">
      <div className="w-20 h-20 rounded-[30px] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30">
        <Globe size={40} className="animate-pulse" />
      </div>
      <div>
        <h4 className="text-xl font-black italic uppercase tracking-tighter text-black mb-2">Tüm Türkiye</h4>
        <p className="text-xs font-bold text-black/60 leading-relaxed tracking-tight">7 Bölge, 81 İl genelinde hızlı sevkiyat ve uzman uygulama ekiplerimizle hizmetinizdeyiz.</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full">
        <Truck size={14} className="text-blue-600" />
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Hızlı Lojistik Ağı</span>
      </div>
    </div>
  </motion.div>
);

interface VisualElementProps {
  type: string;
  data?: Record<string, any>;
}

export default function VisualElement({ type, data }: VisualElementProps) {
  if (type === 'badges') return <BadgesVisual data={data} />;
  if (type === 'glass_map') return <GlassMapVisual />;
  return null;
}

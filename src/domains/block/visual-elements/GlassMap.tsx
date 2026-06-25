'use client';
import { motion } from 'framer-motion';
import { Globe, Truck } from 'lucide-react';

interface GlassMapData {
  title?: string;
  description?: string;
  ctaLabel?: string;
}

export default function GlassMap({ data }: { data?: GlassMapData }) {
  const title = data?.title || 'Tüm Türkiye';
  const description = data?.description || '7 Bölge, 81 İl genelinde hızlı sevkiyat ve uzman uygulama ekiplerimizle hizmetinizdeyiz.';
  const ctaLabel = data?.ctaLabel || 'Hızlı Lojistik Ağı';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative h-full flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-400/5 rounded-[40px]" />

      {/* Animated Rings */}
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
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-black mb-2">{title}</h4>
          <p className="text-xs font-bold text-black/60 leading-relaxed tracking-tight">{description}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full">
          <Truck size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{ctaLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}
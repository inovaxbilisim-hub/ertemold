'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, CheckCircle2, Sparkles, Truck, MapPin, Zap, Globe, Activity } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Shield,
  Award,
  CheckCircle2,
  Sparkles,
  Truck,
  MapPin,
  Zap,
  Globe,
  Activity,
};

interface BadgeItem {
  icon: string | React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  color: string;
  bg: string;
}

interface BadgesData {
  badges?: BadgeItem[];
}

const DEFAULT_BADGES: BadgeItem[] = [
  { icon: Shield, label: 'Garantili Uygulama', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Award, label: 'ISO Sertifikalı', color: 'text-teal-600', bg: 'bg-teal-50' },
  { icon: CheckCircle2, label: 'HACCP Uyumlu', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: Sparkles, label: 'Premium İşçilik', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function Badges({ data }: { data?: BadgesData }) {
  const badges = data?.badges || DEFAULT_BADGES;

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 gap-4 h-full content-center"
    >
      {badges.map((badge, idx) => {
        const Icon = typeof badge.icon === 'string'
          ? (iconMap[badge.icon] || Shield)
          : (badge.icon || Shield);
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
}
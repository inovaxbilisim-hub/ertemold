'use client';
import React from 'react';
import { 
  Shield, Users, Award, Zap, Target, 
  HeartHandshake, CheckCircle2, 
  Phone, Globe, Sparkles, Rocket
} from 'lucide-react';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PhoneLink from '@/shared/layout/PhoneLink';
import { useSettings } from '@/modules/settings/context/SettingsContext';

interface AboutProps {
  badge?: string;
  title?: string;
  descriptionTop?: string;
  descriptionBottom?: string;
  imagePath?: string;
  images?: string[];
  imageSide?: "left" | "right";
  milestones?: { val: string; label: string }[];
  missionTitle?: string;
  missionDesc?: string;
  visionTitle?: string;
  visionDesc?: string;
  valuesTitle?: string;
  values?: { iconName: string; title: string; desc: string }[];
  ctaTitle?: string;
  ctaDesc?: string;
  ctaButtonText?: string;
  ctaPhone?: string;
  contentData?: any;
}

const iconMap: Record<string, any> = {
  Shield, Users, Award, Zap, Target, 
  HeartHandshake, CheckCircle2, Globe, Sparkles, Rocket
};

export default function AboutSection({
  badge = "20+ Yıllık Deneyim",
  title = "HAKKIMIZDA",
  descriptionTop = "",
  descriptionBottom = "Geniş hizmet yelpazemiz ve yenilikçi çözümlerimizle kurumların sürdürülebilir büyümesine katkı sağlıyoruz. Uzman ekibimiz ve yeni nesil teknolojilerimizle her projeye özgü stratejik çözümler üreterek, iş ortaklarımızın dijital dönüşüm yolculuklarına değer katıyoruz.",
  imagePath,
  images = [],
  imageSide = "right",
  milestones = [],
  missionTitle = "Misyonumuz",
  missionDesc = "",
  visionTitle = "Vizyonumuz",
  visionDesc = "",
  valuesTitle = "Değerlerimiz",
  values = [],
  ctaTitle = "Bizimle İletişime Geçin",
  ctaDesc = "",
  ctaButtonText = "İletişim Formu",
  ctaPhone = "",
  contentData
}: AboutProps) {
  const { settings } = useSettings();
  
  // Create a combined list of images
  const allImages = React.useMemo(() => {
    // If the new 'images' array has items, use it exclusively to avoid duplicates from legacy 'imagePath'
    if (images && images.length > 0) {
      return images;
    }
    // Fallback to legacy single 'imagePath' if array is empty
    if (imagePath) {
      return [imagePath];
    }
    // Final fallback
    return ['/images/placeholder.jpg'];
  }, [images, imagePath]);

  // Priority to settings phone as requested by user
  const finalPhone = settings?.phone || ctaPhone || '';

  return (
    <main className="min-h-screen bg-white overflow-hidden pb-12">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/[0.05] blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal/[0.05] blur-[120px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-[1240px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-black/5 bg-black/[0.02] mb-10 shadow-sm"
            >
              <Shield size={16} className="text-blue-600" />
              <span className="text-black/60 text-[11px] font-black uppercase tracking-[0.4em]">{badge}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-2xl font-black text-black leading-tight tracking-tighter italic uppercase mb-8"
            >
              <span className="block">{title.split(' ')[0]}</span>
              {title.split(' ').length > 1 && (
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal">
                  {title.split(' ').slice(1).join(' ')}
                </span>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-black/40 font-black uppercase tracking-tight max-w-[700px] leading-relaxed"
            >
              {descriptionTop}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Modern Stats Bar */}
      <div className="max-w-[1240px] mx-auto px-6 -mt-12 mb-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-black/5 rounded-[40px] shadow-2xl">
          {milestones.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center justify-center p-6 rounded-[30px] hover:bg-[#fbfcff] transition-colors group"
            >
              <span className="text-lg md:text-xl font-black text-black mb-1 italic tracking-tighter group-hover:text-blue-600 transition-colors">
                {stat.val}
              </span>
              <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Story Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: imageSide === 'left' ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`space-y-8 ${imageSide === 'left' ? 'order-2' : 'order-1'}`}
            >
              <div className="space-y-4">
                <div className="w-10 h-1 bg-gradient-to-r from-blue-600 to-teal rounded-full" />
                <h2 className="text-xl md:text-2xl font-black text-black italic uppercase tracking-tighter leading-tight">
                  {contentData?.storyTitle || 'Uzmanlık Ve Güvenin Adresi'}
                </h2>
                <p className="text-sm md:text-base text-black/50 leading-relaxed font-medium pt-2">
                  {descriptionBottom}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mission */}
                <div className="bg-[#fbfcff] p-8 rounded-[40px] border border-black/5 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                    <Target size={20} />
                  </div>
                  <h3 className="text-lg font-black text-black uppercase italic mb-2">{missionTitle}</h3>
                  <p className="text-[12px] text-black/40 font-bold uppercase tracking-tight leading-relaxed">{missionDesc}</p>
                </div>

                {/* Vision */}
                <div className="bg-[#fbfcff] p-8 rounded-[40px] border border-black/5 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center mb-4 text-teal group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-black text-black uppercase italic mb-2">{visionTitle}</h3>
                  <p className="text-[12px] text-black/40 font-bold uppercase tracking-tight leading-relaxed">{visionDesc}</p>
                </div>
              </div>
            </motion.div>

            {(imagePath || images.length > 0) && (
              <div className={`relative ${imageSide === 'left' ? 'order-1' : 'order-2'}`}>
                <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
                  {allImages.map((img, idx) => (
                    <motion.div
                      key={img + idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * idx, duration: 0.8 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className={`relative rounded-[30px] md:rounded-[40px] overflow-hidden shadow-xl border-4 border-white group shadow-black/5 hover:shadow-blue-600/10 transition-all duration-500
                        ${idx === 0 ? 'col-span-1 h-[250px] md:h-[350px]' : ''}
                        ${idx === 1 ? 'col-span-1 h-[220px] md:h-[300px] mt-8 md:mt-12' : ''}
                        ${idx === 2 ? 'col-span-1 h-[200px] md:h-[280px] -mt-4 md:-mt-8' : ''}
                        ${idx >= 3 ? 'col-span-1 h-[230px] md:h-[320px]' : ''}
                      `}
                    >
                      <CloudinaryImage
                        src={img}
                        alt={`${title} - Görsel ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                        loading="lazy"
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </motion.div>
                  ))}
                </div>

                {/* Floating Badge - Light Mode */}
                <div className="absolute -bottom-6 -left-6 bg-white border border-black/5 text-black p-6 rounded-[30px] shadow-2xl hidden md:block animate-bounce-slow z-30">
                   <p className="text-[8px] font-black tracking-[0.3em] uppercase opacity-40 mb-1">{contentData?.experienceLabel || 'Tecrübeli'}</p>
                   <p className="text-xl font-black italic tracking-tighter text-blue-600">
                     {contentData?.experienceYears || '20+ YIL'}
                   </p>
                </div>

                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 blur-[80px] rounded-full -z-10" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium Values Grid */}
      <section className="py-20 px-6 bg-[#fbfcff] relative">
        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="max-w-[1240px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-2xl font-black text-black italic uppercase tracking-tighter"
            >
              {valuesTitle}
            </motion.h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-teal mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, idx) => {
              const Icon = iconMap[v.iconName] || Shield;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-10 rounded-[50px] border border-black/5 shadow-md hover:shadow-2xl transition-all duration-500 group relative overflow-hidden h-full"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#fbfcff] border border-black/5 flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-black text-black mb-4 italic uppercase tracking-tight leading-tight">
                    {v.title}
                  </h3>
                  <p className="text-black/40 text-[13px] font-bold uppercase leading-relaxed tracking-tight group-hover:text-black/60 transition-colors">
                    {v.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium CTA Finale */}
      <section className="px-6 py-20">
        <div className="max-w-[1240px] mx-auto bg-[#fbfcff] border border-black/5 rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-teal" />
          
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-2xl font-black text-black tracking-tighter mb-6 relative z-10 leading-tight italic uppercase"
          >
            {ctaTitle}
          </motion.h2>
          
          <p className="text-black/40 text-sm md:text-base font-black uppercase tracking-tight max-w-[600px] mx-auto mb-10 relative z-10">
            {ctaDesc}
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center relative z-10">
            <Link 
              href="/iletisim" 
              className="px-12 py-6 bg-black text-white rounded-2xl text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-black/20"
            >
              {ctaButtonText}
            </Link>
            {finalPhone && (
              <PhoneLink
                phone={finalPhone}
                source="about-cta"
                className="flex items-center gap-3 text-black text-xl font-black italic tracking-tighter hover:text-blue-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                {finalPhone}
              </PhoneLink>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

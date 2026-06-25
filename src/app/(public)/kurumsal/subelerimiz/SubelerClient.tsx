'use client';

import BranchCard from '@/modules/content/sections/BranchCard';
import PhoneLink from '@/shared/layout/PhoneLink';
import { MapPin, Building2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SubelerClient({ branches, settings }: { branches: any[], settings: any }) {
  const activeBranches = branches.filter(b => b.active);
  const merkez = activeBranches.find(b => b.type === 'merkez');
  const digerSubeler = activeBranches.filter(b => b.type !== 'merkez');
  const branchesUi = settings?.uiContent?.branches;

  return (
    <main className="min-h-screen pt-32 pb-20 bg-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/[0.03] blur-[150px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        {/* Header Section (Elite Style) */}
        <div className="mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-black/5 bg-black/[0.02] mb-10 shadow-sm"
          >
            <MapPin size={16} className="text-blue-600" />
            <span className="text-black/60 text-[11px] font-black uppercase tracking-[0.4em]">{branchesUi?.heroBadge}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl font-black text-black leading-[0.85] tracking-tighter italic uppercase mb-12"
          >
            {branchesUi?.heroTitlePrefix} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal">S E C U R I</span> {branchesUi?.heroTitleSuffix}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-black/40 font-black uppercase tracking-tight max-w-[800px] mx-auto leading-relaxed"
          >
            {branchesUi?.heroDescription}
          </motion.p>
        </div>

        {/* Section Title: Kurumsal Ofisler */}
        {merkez && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center gap-6"
          >
            <div className="px-6 py-2 rounded-2xl bg-[#fbfcff] border border-black/5 shadow-sm">
              <h2 className="text-[13px] font-black text-black uppercase tracking-[0.2em] leading-none flex items-center gap-3">
                <Building2 size={18} className="text-blue-600" /> {branchesUi?.centerBadge}
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent" />
          </motion.div>
        )}

        <div className="grid gap-12">
          {/* Genel Merkez */}
          {merkez && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full"
            >
               <BranchCard branch={merkez} isMerkez={true} ui={branchesUi} />
            </motion.div>
          )}

          {/* Diğer Şubeler Header */}
          {digerSubeler.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 mb-8 flex items-center gap-6"
            >
              <div className="px-6 py-2 rounded-2xl bg-[#fbfcff] border border-black/5 shadow-sm">
                <h2 className="text-[13px] font-black text-black uppercase tracking-[0.2em] leading-none">{branchesUi?.branchBadge}</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent" />
            </motion.div>
          )}

          {/* Diğer Şubeler Grid */}
          <div className="grid gap-10 md:grid-cols-2">
            {digerSubeler.map((branch, idx) => (
              <motion.div 
                key={branch.id} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <BranchCard branch={branch} ui={branchesUi} />
              </motion.div>
            ))}
          </div>

          {activeBranches.length === 0 && (
            <div className="text-center py-32 rounded-[60px] border-2 border-dashed border-black/5">
               <p className="text-black/30 font-black uppercase tracking-widest">{branchesUi?.emptyText}</p>
            </div>
          )}
        </div>

        {/* Premium CTA Finale for Branches */}
        <section className="mt-32">
          <div className="max-w-[1240px] mx-auto bg-black rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 grid-pattern opacity-[0.1] contrast-200" />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-teal" />
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-lg md:text-2xl font-black text-white tracking-tighter mb-8 relative z-10 leading-tight italic uppercase"
            >
              {branchesUi?.ctaTitle}
            </motion.h2>
            
            <p className="text-white/40 text-sm md:text-base font-black uppercase tracking-tight max-w-[600px] mx-auto mb-10 relative z-10">
              {branchesUi?.ctaDescription}
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center relative z-10">
              <Link 
                href="/iletisim" 
                className="px-12 py-6 bg-white text-black rounded-2xl text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-white/10 shadow-xl"
              >
                {branchesUi?.ctaButtonText}
              </Link>
              {settings?.phone && (
                <PhoneLink
                  phone={settings.phone}
                  source="branches-cta"
                  className="flex items-center gap-4 text-white text-xl font-black italic tracking-tighter hover:text-blue-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  {settings.phone}
                </PhoneLink>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

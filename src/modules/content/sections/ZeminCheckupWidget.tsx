'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Zap, Droplets, HardHat, Factory, FileText, Activity, ShieldCheck, Clock } from 'lucide-react';
import { useZeminCheckup } from '@/hooks/useZeminCheckup';
import PhoneLink from '@/shared/layout/PhoneLink';

const iconMap: Record<string, React.ReactElement> = {
  Factory: <Factory size={24} />,
  Zap: <Zap size={24} />,
  CheckCircle2: <CheckCircle2 size={24} />,
  AlertCircle: <Activity size={24} />,
  HardHat: <HardHat size={24} />,
  Droplets: <Droplets size={24} />
};

export default function ZeminCheckupWidget() {
  const {
    steps,
    uiTexts,
    phone,
    currentStep,
    
    isCompleted,
    recommendation,
    analizId,
    handleStart,
    handleSelect,
    handleBack,
    selections: _selections
  } = useZeminCheckup();

  const phoneClean = phone.replace(/\s/g, '');

  return (
    <div className="bg-slate-50 py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container-boxed max-w-[1000px] mx-auto relative z-10 px-2 sm:px-4">
        <div className="bg-white rounded-[20px] md:rounded-[40px] shadow-2xl border border-slate-200/60 p-4 sm:p-8 md:p-12 overflow-hidden min-h-[450px] md:min-h-[600px] flex flex-col relative">
          
          <AnimatePresence mode="wait">
            {/* START SCREEN */}
            {currentStep === -1 && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-grow flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
                  {uiTexts.title}
                </h2>
                <p className="text-sm md:text-lg text-slate-500 max-w-[600px] mb-8 leading-relaxed font-medium">
                  {uiTexts.subtitle}
                </p>
                <button
                  onClick={handleStart}
                  className="group inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-sm md:text-base font-black uppercase tracking-widest transition-all hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/20 whitespace-nowrap"
                >
                  {uiTexts.buttonText}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* QUESTIONS SCREEN */}
            {currentStep >= 0 && !isCompleted && (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-grow flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <button 
                    onClick={handleBack}
                    className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    <ArrowRight size={16} className="rotate-180" /> Geri
                  </button>
                  <div className="text-sm font-black text-slate-300 tracking-widest">
                    ADIM {currentStep + 1} / {steps.length}
                  </div>
                </div>

                <div className="mb-6 md:mb-12">
                  <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight leading-tight">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-sm md:text-lg text-slate-500 font-medium">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 mt-auto">
                  {steps[currentStep].options.map((opt: { id: string; label: string; iconName: string }) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(steps[currentStep].id, opt.id)}
                      className="group flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-6 p-3 md:p-8 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl text-center md:text-left hover:border-blue-600 hover:bg-blue-50/5 transition-all hover:-translate-y-1 hover:shadow-xl w-full"
                    >
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6">
                        {iconMap[opt.iconName] || <CheckCircle2 />}
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-blue-900 text-[11px] sm:text-xs md:text-xl leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RESULT SCREEN */}
            {isCompleted && recommendation && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-grow flex flex-col"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-6 border-b border-slate-100 gap-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-green-100 shadow-sm flex-shrink-0">
                        <FileText size={20} className="md:w-7 md:h-7" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                          {uiTexts.resultTitle}
                        </h2>
                        <p className="text-slate-500 font-medium text-[10px] md:text-sm">Analiz: #ERT-{analizId}</p>
                      </div>
                   </div>
                   <div className="hidden md:block">
                      <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                        Sizin İçin En Uygun Hizmet
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-6">
                   <div className="space-y-4 md:space-y-6">
                      <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-[32px] border border-slate-100">
                        <h4 className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest mb-2 md:mb-3">Tavsiye Edilen Çözüm</h4>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2 md:mb-3 tracking-tight leading-tight">
                          {recommendation.serviceName}
                        </h3>
                        <p className="text-slate-600 font-medium leading-snug md:leading-relaxed text-xs md:text-base italic">
                          "{recommendation.description}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="p-3 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-2xl flex flex-col gap-1 md:gap-2">
                           <Clock size={16} className="text-slate-400 md:w-5 md:h-5" />
                           <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Tahmini Ömür</div>
                           <div className="text-sm md:text-lg font-black text-slate-800">{recommendation.estimatedDurability}</div>
                        </div>
                        <div className="p-3 md:p-5 bg-white border border-slate-100 rounded-xl md:rounded-2xl flex flex-col gap-1 md:gap-2">
                           <ShieldCheck size={16} className="text-slate-400 md:w-5 md:h-5" />
                           <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Garanti</div>
                           <div className="text-sm md:text-lg font-black text-slate-800">5 Yıl</div>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-col">
                      <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-6">Teknik Analiz Raporu</h4>
                      <div className="space-y-2 md:space-y-4">
                        {recommendation.technicalSpecs.map((spec, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 md:p-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 size={12} strokeWidth={3} className="md:w-[14px] md:h-[14px]" />
                            </div>
                            <span className="font-bold text-slate-700 text-xs md:text-base leading-tight">{spec}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-blue-50/50 border border-blue-100 rounded-xl md:rounded-2xl">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <Zap size={12} fill="currentColor" className="md:w-[14px] md:h-[14px]" />
                          </div>
                          <span className="font-bold text-blue-900 text-xs md:text-base leading-tight">Ücretsiz Keşif Dahil</span>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-row gap-2 sm:gap-4 w-full mt-auto pt-4 md:pt-8 border-t border-slate-100">
                  <PhoneLink
                    phone={phoneClean}
                    source="zemin-checkup-result"
                    className="group flex-grow inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 md:px-8 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-blue-700 hover:scale-[1.02] shadow-xl shadow-blue-600/20 text-[10px] md:text-sm text-center"
                  >
                    {uiTexts.resultCtaText}
                    <ArrowRight size={14} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
                  </PhoneLink>
                  <button
                    onClick={handleStart}
                    className="flex-shrink-0 inline-flex items-center justify-center px-4 md:px-8 py-3 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-slate-500 bg-white border-2 border-slate-200 hover:border-slate-400 transition-all text-[10px] md:text-sm"
                  >
                    Yeni Analiz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar (Bottom) */}
          {currentStep >= 0 && !isCompleted && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-100">
              <motion.div 
                className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

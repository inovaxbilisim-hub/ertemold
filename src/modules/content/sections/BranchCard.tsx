'use client';

import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import PhoneLink from '@/shared/layout/PhoneLink';
import { Branch, SiteUiContent } from '@/core/types';

interface BranchCardProps {
  branch: Branch;
  isMerkez?: boolean;
  ui?: SiteUiContent['branches'];
}

export default function BranchCard({ branch, isMerkez, ui }: BranchCardProps) {
  const accentColor = isMerkez ? 'text-blue-600' : 'text-teal';
  const accentBg = isMerkez ? 'bg-blue-600/10' : 'bg-teal/10';
  const accentBorder = isMerkez ? 'border-blue-600/10' : 'border-teal/10';

  return (
    <div className={`bg-[#fbfcff] border border-black/5 rounded-[40px] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/5 group premium-shadow`}>

      {/* ── Accent top bar ── */}
      <div className={`h-1.5 w-full ${isMerkez ? 'bg-blue-600' : 'bg-teal'} opacity-90`} />

      {/* ── Map Header ── */}
      <div className="h-[260px] w-full bg-gray-100 relative overflow-hidden">
        {branch.maps_embed ? (
          <div 
            className="w-full h-full filter grayscale-[40%] contrast-125 group-hover:grayscale-0 transition-all duration-1000 opacity-90 group-hover:opacity-100 scale-105 group-hover:scale-100"
            dangerouslySetInnerHTML={{ 
              __html: branch.maps_embed
                .replace(/width="[^"]*"/, 'width="100%"')
                .replace(/height="[^"]*"/, 'height="100%"')
                .replace(/style="[^"]*"/, 'style="border:0; width:100%; height:100%; pointer-events:none;"')
            }} 
          />
        ) : (
          <iframe
            title={`${branch.title} Map`}
            width="100%"
            height="100%"
            className="border-0 filter grayscale-[40%] contrast-125 group-hover:grayscale-0 transition-all duration-1000 opacity-90 group-hover:opacity-100 scale-105 group-hover:scale-100 pointer-events-none"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(branch.address || '')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          />
        )}
        
        {/* Badge Overlay */}
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl border border-black/5 px-6 py-2.5 rounded-2xl text-[11px] font-black text-black shadow-xl flex items-center gap-3 uppercase tracking-[0.2em] z-10 transition-transform group-hover:scale-110">
          <div className={`w-2.5 h-2.5 rounded-full ${isMerkez ? 'bg-blue-600 shadow-[0_0_10px_rgba(0,102,204,0.4)]' : 'bg-teal shadow-[0_0_10px_rgba(0,212,170,0.4)]'}`} />
          {isMerkez ? ui?.centerLabel : ui?.branchLabel}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-8 md:p-12 flex-1 flex flex-col gap-10 relative z-10">
        
        {/* Title & Address */}
        <div>
          <h3 className="text-black font-black text-lg md:text-xl tracking-tighter mb-4 leading-tight group-hover:text-blue-600 transition-colors uppercase italic">
            {branch.title}
          </h3>
          <div className="flex gap-4">
             <MapPin size={20} className={`${accentColor} shrink-0 mt-1`} />
             <p className="text-black/40 text-[15px] font-bold leading-relaxed uppercase tracking-tight">
               {branch.address}
             </p>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PhoneLink phone={branch.phone} branch={branch} source="branch-card" className="bg-white border border-black/5 p-6 rounded-3xl transition-all hover:border-black/10 hover:shadow-lg group/btn shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center mb-4 group-hover/btn:scale-110 transition-transform`}>
              <Phone size={18} className={accentColor} />
            </div>
            <p className="text-black/30 text-[10px] font-black uppercase tracking-[0.25em] mb-2 leading-none">{ui?.cardPhoneLabel}</p>
            <p className="text-black font-black text-base tracking-tighter">{branch.phone}</p>
          </PhoneLink>
          <a href={`mailto:${branch.email}`} className="bg-white border border-black/5 p-6 rounded-3xl transition-all hover:border-black/10 hover:shadow-lg group/btn shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center mb-4 group-hover/btn:scale-110 transition-transform`}>
              <Mail size={18} className={accentColor} />
            </div>
            <p className="text-black/30 text-[10px] font-black uppercase tracking-[0.25em] mb-2 leading-none">{ui?.cardEmailLabel}</p>
            <p className="text-black font-black text-base tracking-tighter truncate">{branch.email}</p>
          </a>
        </div>

        {/* Hours section */}
        <div className={`p-8 rounded-[32px] border ${accentBorder} bg-black/[0.01] relative overflow-hidden group-hover:bg-black/[0.02] transition-colors`}>
          <div className="flex items-center gap-4 mb-6">
            <Clock size={20} className={accentColor} />
            <span className="text-[12px] font-black text-black uppercase tracking-[0.25em]">{ui?.cardHoursLabel}</span>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-black/30 text-xs font-black uppercase">{ui?.cardWeekdayLabel}</span>
               <span className="text-black font-black text-sm tracking-tight">
                 {branch.working_hours?.mon_fri 
                   ? `${branch.working_hours.mon_fri.opens || '09:00'}–${branch.working_hours.mon_fri.closes || '18:00'}`
                   : '09:00–18:00'}
               </span>
             </div>
             <div className="h-px bg-black/[0.05] w-full" />
             <div className="flex justify-between items-center">
               <span className="text-black/30 text-xs font-black uppercase">{ui?.cardWeekendLabel}</span>
               <span className="text-black font-black text-sm tracking-tight">
                 {branch.working_hours?.sat 
                   ? `${branch.working_hours.sat.opens || '09:00'}–${branch.working_hours.sat.closes || '13:00'}`
                   : '09:00–13:00'}
               </span>
             </div>
          </div>
        </div>

        {/* Action button */}
        {(branch.maps_link || branch.address) && (
          <a 
            href={branch.maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address || '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`mt-auto flex items-center justify-center gap-4 py-6 rounded-2xl font-black text-[15px] tracking-[0.1em] uppercase transition-all hover:brightness-110 active:scale-95 shadow-xl ${isMerkez ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-black text-white shadow-black/10'}`}
          >
            {ui?.cardNavLabel} <ExternalLink size={20} strokeWidth={3} />
          </a>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import type { FAQ } from '@/core/types';

interface FaqSectionProps {
  faqs: FAQ[];
  title?: string;
  badge?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export default function FaqSection({ 
  faqs, 
  title = "Sıkça Sorulan Sorular", 
  badge = "S.S.S",
  ctaLabel,
  ctaLink
}: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Filter only active FAQs
  const activeFaqs = faqs.filter(f => {
    if (typeof f.active === 'boolean') return f.active;
    return String(f.active) === '1' || String(f.active) === 'true';
  });

  if (!activeFaqs.length) return null;

  // Group by category
  const groupedFaqs = activeFaqs.reduce((acc, faq) => {
    const cat = faq.category || 'Genel';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const categories = Object.keys(groupedFaqs);

  return (
    <section className="py-16 md:py-24 bg-bg-secondary/30 relative overflow-hidden" id="faq">
      {/* Premium Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-teal/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 mb-4 backdrop-blur-sm">
            <HelpCircle size={14} className="text-accent-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">{badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-4 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Hizmetlerimiz, teknik detaylar ve uygulama süreçleri hakkında merak edilenlerin yanıtlarını burada bulabilirsiniz.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {categories.map((category, catIdx) => (
            <div key={category} className={`mb-8 last:mb-0 ${catIdx !== 0 ? 'mt-12' : ''}`}>
              {category !== 'Genel' && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-subtle to-transparent opacity-30" />
                  <h3 className="text-[10px] font-black text-accent-blue/50 uppercase tracking-[0.3em] whitespace-nowrap">
                    {category}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-subtle to-transparent opacity-30" />
                </div>
              )}
              
              <div className="space-y-3">
                {groupedFaqs[category].map((item) => (
                  <div 
                    key={item.id} 
                    className={`group border transition-all duration-300 rounded-xl overflow-hidden ${
                      openId === item.id 
                        ? 'border-accent-blue/20 bg-bg-primary shadow-[0_15px_40px_rgba(0,0,0,0.08)]' 
                        : 'border-subtle bg-bg-primary/40 hover:border-accent-blue/10 hover:bg-bg-primary/60'
                    }`}
                  >
                    <button
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          openId === item.id 
                            ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20' 
                            : 'bg-accent-blue/5 text-accent-blue'
                        }`}>
                          <HelpCircle size={18} />
                        </div>
                        <span className={`font-bold text-sm sm:text-base leading-snug transition-colors duration-300 ${
                          openId === item.id ? 'text-accent-blue' : 'text-text-primary'
                        }`}>
                          {item.question}
                        </span>
                      </div>
                      <div className={`ml-4 transition-transform duration-300 ${
                        openId === item.id ? 'rotate-180 text-accent-blue' : 'text-text-muted'
                      }`}>
                        <ChevronDown size={18} strokeWidth={2.5} />
                      </div>
                    </button>

                    <div 
                      className={`transition-all duration-300 ease-out ${
                        openId === item.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 invisible'
                      }`}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-7 sm:ml-12 text-text-muted">
                        <div className="h-px w-full bg-gradient-to-r from-accent-blue/20 via-transparent to-transparent mb-4" />
                        <div 
                          className="prose prose-sm prose-invert max-w-none faq-answer-content"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(item.answer, {
                              ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'a', 'span', 'div'],
                              ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {ctaLabel && ctaLink && (
          <div className="mt-12 text-center">
            <a 
              href={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-accent-blue/10 text-accent-blue font-black uppercase tracking-widest text-xs hover:bg-accent-blue hover:text-white transition-all shadow-xl shadow-blue-600/5 group"
            >
              {ctaLabel}
              <ChevronDown className="-rotate-90 group-hover:translate-x-1 transition-transform" size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}


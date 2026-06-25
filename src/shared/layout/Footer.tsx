'use client';

import CloudinaryImage from '@/shared/components/CloudinaryImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, MapPin, Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';
import PhoneLink from '@/shared/layout/PhoneLink';
import { Facebook, Instagram, Linkedin, Youtube } from '@/shared/components/BrandIcons';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { useLocation } from '@/modules/settings/context/LocationContext';
import type { FooterLink, FooterLinkGroup, SocialMedia } from '@/core/types';

export default function Footer() {
  const { settings } = useSettings();
  const { activeBranch } = useLocation();
  const pathname = usePathname();
  const footerUi = settings?.uiContent.footer;
  const logoPath = settings?.brand?.footerLogoPath || settings?.brand?.logoPath;

  if (pathname?.startsWith('/admin')) return null;

  const socialIconMap: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  const activeSocial = (settings?.socialMedia || []).filter((item: SocialMedia) => item.active && item.url);
  const branches = settings?.branches || [];
  const primaryBranch =
    activeBranch ||
    branches.find(b => b.type === 'merkez' && b.active) ||
    branches.find(b => b.active);

  const brandName = settings?.companyName || settings?.title || 'Kurumsal Marka';
  const brandShortName = settings?.brand?.shortName || brandName;

  // Determine link columns: prefer grouped, fall back to logical defaults
  const groups: FooterLinkGroup[] = (settings?.footerLinkGroups && settings.footerLinkGroups.length > 0)
    ? settings.footerLinkGroups
    : buildFallbackGroups();

  function buildFallbackGroups(): FooterLinkGroup[] {
    // If we have legacy links, try to divide them, otherwise use sensible defaults
    if (settings?.footerLinks && settings.footerLinks.length > 0) {
      const mid = Math.ceil(settings.footerLinks.length / 2);
      return [
        { title: footerUi?.pagesTitle || 'Sayfalar', links: settings.footerLinks.slice(0, mid) },
        { title: footerUi?.linksTitle || 'Bağlantılar', links: settings.footerLinks.slice(mid) },
      ].filter(g => g.links.length > 0);
    }
    
    // Generate dynamic fallback based on site navigation to avoid hardcoding sector-specific terms
    const dynamicGroups: FooterLinkGroup[] = [];
    const navItems = settings?.navigation || [];
    
    if (navItems.length > 0) {
      // Split navigation items logically
      const mid = Math.ceil(navItems.length / 2);
      dynamicGroups.push({
        title: footerUi?.pagesTitle || 'Sayfalar',
        links: navItems.slice(0, mid).map(n => ({ label: n.label, href: n.href }))
      });
      dynamicGroups.push({
        title: footerUi?.linksTitle || 'Hızlı Menü',
        links: navItems.slice(mid).map(n => ({ label: n.label, href: n.href }))
      });
    }

    // Always append a generic contact group
    dynamicGroups.push({
      title: footerUi?.contactTitle || 'Destek',
      links: [
        { label: 'İletişim', href: '/iletisim' },
        { label: 'Ücretsiz Teklif', href: '/iletisim' }
      ]
    });

    return dynamicGroups;
  }

  return (
    <footer className="relative mt-auto overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #060b18 100%)' }}>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }} />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

      {/* ─── MAIN GRID ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-6 md:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(var(--cols),1fr)_1.8fr] gap-x-10 gap-y-6 lg:gap-8"
          style={{ '--cols': groups.length } as React.CSSProperties}>

          {/* ── Brand column ── */}
          <div className="flex flex-col gap-6 mb-4 md:mb-0">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              {logoPath ? (
                <CloudinaryImage
                  src={logoPath}
                  alt={brandName}
                  width={settings.brand?.footerLogoMaxWidth || 200}
                  height={settings.brand?.footerLogoMaxHeight || 60}
                  loading="lazy"
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxWidth: `${settings.brand?.footerLogoMaxWidth || 200}px`, 
                    maxHeight: `${settings.brand?.footerLogoMaxHeight || 60}px`, 
                    objectFit: 'contain' 
                  }}
                />
              ) : (
                <div className="text-xl font-bold text-white tracking-wide">{brandShortName}</div>
              )}
            </Link>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '260px' }}>
              {settings?.companyDescription || 'Profesyonel kurumsal çözümler sunan modern ve güvenilir hizmet platformu.'}
            </p>

            {/* Social */}
            {activeSocial.length > 0 && (
              <div className="flex gap-3 mt-1">
                {activeSocial.map((social, i) => {
                  const SocialIcon = socialIconMap[social.platform] || Globe;
                  return (
                    <a
                      key={`${social.platform}-${i}`}
                      href={social.url}
                      aria-label={social.platform}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    >
                      <SocialIcon size={16} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Link Group columns (Collapsible on Mobile) ── */}
          {groups.map((group, gi) => (
            <div key={gi} className="flex flex-col border-b border-white/5 md:border-none last:border-none md:last:border-none">
              
              {/* Desktop Header */}
              <h4 className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {group.title}
              </h4>
              
              {/* Mobile Accordion */}
              <details className="group/accordion md:hidden">
                <summary className="flex items-center justify-between py-3 text-[11px] font-bold uppercase tracking-[0.2em] cursor-pointer list-none [&::-webkit-details-marker]:hidden" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {group.title}
                  <span className="group-open/accordion:rotate-180 transition-transform duration-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </span>
                </summary>
                <div className="pb-4 pt-1">
                  <ul className="flex flex-col gap-3">
                    {group.links.map((link: FooterLink, li) => (
                      <li key={li}>
                        <Link href={link.href} className="text-sm transition-colors duration-200 block py-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Desktop Links List */}
              <ul className="hidden md:flex flex-col gap-2.5">
                {group.links.map((link: FooterLink, li) => (
                  <li key={li}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 group flex items-center gap-1"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.9)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── Contact column ── */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {footerUi?.contactTitle || 'İletişim'}
            </h4>

            {primaryBranch ? (
              <div className="flex flex-col gap-3">
                {primaryBranch.address && (
                  <a
                    href={primaryBranch.maps_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    <span className="leading-relaxed">{primaryBranch.address}</span>
                  </a>
                )}
                {primaryBranch.email && (
                  <a
                    href={`mailto:${primaryBranch.email}`}
                    className="flex items-center gap-2.5 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    <Mail size={14} className="shrink-0 text-blue-400" />
                    {primaryBranch.email}
                  </a>
                )}
                {primaryBranch.phone && (
                  <PhoneLink
                    phone={primaryBranch.phone}
                    branch={primaryBranch}
                    source="footer"
                    className="flex items-center gap-2.5 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' } as React.CSSProperties}
                  >
                    <Phone size={14} className="shrink-0 text-blue-400" />
                    {primaryBranch.phone}
                  </PhoneLink>
                )}
                {settings?.workingHours && (
                  <div className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Clock size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    <span>{settings.workingHours}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {footerUi?.missingContactText || 'İletişim bilgisi girilmedi.'}
              </p>
            )}

            {/* CTA mini */}
            <Link
              href="/iletisim"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Teklif Al <ArrowRight size={13} />
            </Link>
          </div>

        </div>

        {/* ─── BOTTOM BAR ────────────────────────────────────── */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>

          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            &copy; {new Date().getFullYear()} {brandName}. {footerUi?.copyrightText || 'Tüm hakları saklıdır.'}
          </p>

          <div className="flex flex-wrap gap-5">
            {(settings?.footerBottomLinks || []).map((link: FooterLink, i) => (
              <Link
                key={i}
                href={link.href}
                className="text-[12px] transition-colors"
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.2)'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

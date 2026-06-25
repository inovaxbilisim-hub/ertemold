'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import CloudinaryImage from '@/shared/components/CloudinaryImage';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, Phone, Shield, X } from 'lucide-react';
import PhoneLink from '@/shared/layout/PhoneLink';
import { useLocation } from '@/modules/settings/context/LocationContext';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { NavItem, Service, ServiceCategory } from '@/core/types';

const defaultNavLinks: NavItem[] = [];
type ServiceSummary = Pick<Service, 'id' | 'slug' | 'category_id' | 'title'>;

function isServicesHub(link: NavItem) {
  return link.href === '/hizmetler';
}

function isExpandable(link: NavItem) {
  return isServicesHub(link) || Boolean(link.children?.length);
}

interface NavbarProps {
  initialServices?: ServiceSummary[];
  initialCategories?: ServiceCategory[];
}

export default function Navbar({ initialServices = [], initialCategories = [] }: NavbarProps) {
  const { settings } = useSettings();
  const { displayPhone } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceSummary[]>(initialServices);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories.filter(c => c.active));
  const [servicesLoading, setServicesLoading] = useState(initialServices.length === 0);
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');
  const phoneHref = displayPhone ? `tel:${displayPhone.replace(/\s/g, '')}` : null;
  const navLinks: NavItem[] = settings?.navigation?.length ? settings.navigation : defaultNavLinks;
  const navbarUi = settings?.uiContent.navbar;

  const serviceCategoryMeta = useMemo(() => {
    const meta: Record<string, { label: string; description: string; href: string }> = {};
    categories.forEach(cat => {
      meta[cat.id] = {
        label: cat.name,
        description: cat.description,
        href: `/${cat.slug}`
      };
    });
    return meta;
  }, [categories]);

  const handleMouseEnter = useCallback((href: string, link: NavItem) => {
    if (isExpandable(link)) setDropdown(href);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDropdown(null);
  }, []);

  useEffect(() => {
    if (initialServices.length > 0 && initialCategories.length > 0) {
      setServicesLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadServicesAndCategories = async () => {
      setServicesLoading(true);

      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch('/api/services', { signal: controller.signal, headers: { Accept: 'application/json' } }),
          fetch('/api/public/categories', { signal: controller.signal, headers: { Accept: 'application/json' } })
        ]);

        if (!servicesRes.ok || !categoriesRes.ok) return;

        const [servicesData, categoriesData] = await Promise.all([
          servicesRes.json(),
          categoriesRes.json()
        ]);

        if (!isMounted) return;

        if (Array.isArray(servicesData)) {
          setServices(servicesData.filter((item): item is ServiceSummary => Boolean(item && typeof item.slug === 'string')));
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.filter((c: ServiceCategory) => c.active));
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Navbar data fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setServicesLoading(false);
        }
      }
    };

    void loadServicesAndCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialServices.length, initialCategories.length]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }, [isOpen]);

  const groupedServices = useMemo(() => categories
    .map((cat) => ({
      category: cat.id,
      ...serviceCategoryMeta[cat.id],
      services: services.filter((service) => service.category_id === cat.id),
    }))
    .filter((group) => group.services.length > 0), [categories, services, serviceCategoryMeta]);

  if (isAdminRoute) {
    return null;
  }

  const closeMenus = () => {
    setDropdown(null);
    setIsOpen(false);
    setMobileExpanded(null);
  };

  const toggleMobileSection = (href: string) => {
    setMobileExpanded((current) => (current === href ? null : href));
  };

  const renderSimpleDropdown = (children: { label: string; href: string }[]) => (
    <div className="absolute top-full left-0 min-w-[220px] glass rounded-xl p-2 shadow-xl animate-scale-in origin-top pt-2 before:absolute before:-top-2 before:left-0 before:w-full before:h-2 before:bg-transparent">
      {children.map((child) => (
        <Link key={child.href} href={child.href} className="block px-4 py-2.5 text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all cursor-pointer" onClick={closeMenus}>
          {child.label}
        </Link>
      ))}
    </div>
  );

  const renderServicesMegaMenu = () => (
    <div className="nav-mega-menu animate-scale-in cursor-default">
      {servicesLoading && groupedServices.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest leading-none">
          {navbarUi?.megaMenuLoadingText}
        </div>
      ) : (
        <div className="nav-mega-categories">
          {groupedServices.map((group) => (
            <section key={group.category} className="nav-mega-category group/cat">
              <Link href={group.href} className="flex items-center justify-between text-[15px] font-black mb-4 text-[var(--text-primary)] hover:text-[var(--color-primary-val)] transition-colors cursor-pointer" onClick={closeMenus}>
                {group.label} <ArrowRight size={14} className="opacity-0 group-hover/cat:opacity-100 group-hover/cat:translate-x-1 transition-all" />
              </Link>
              <div className="flex flex-col gap-2">
                {group.services.slice(0, 5).map((service) => (
                  <Link key={service.id} href={`/hizmetler/${service.slug}`} className="nav-mega-service-link cursor-pointer" onClick={closeMenus}>
                    <span>{service.title}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${scrolled ? 'nav-glass py-3 shadow-sm' : 'bg-transparent py-5'}`} suppressHydrationWarning>
        <nav className="relative z-[10000] max-w-[1280px] mx-auto px-6 flex items-center justify-between" suppressHydrationWarning>
          <Link href="/" className="flex items-center gap-3 group" aria-label="Ana sayfa">
            {settings?.brand?.logoPath ? (
              <div
                style={{
                  position: 'relative',
                  width: Math.min(Number(settings.brand.logoMaxWidth) || 160, 160),
                  height: Math.min(Number(settings.brand.logoMaxHeight) || 48, 48),
                }}
              >
                <CloudinaryImage
                  src={settings.brand.logoPath}
                  alt={settings?.companyName || 'Logo'}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  fetchPriority="high"
                />
              </div>
            ) : (
              <>
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Shield size={22} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="font-black text-lg text-[var(--text-primary)] leading-none tracking-tighter uppercase italic">
                    {(settings?.brand?.shortName || settings?.companyName || settings?.title || 'Marka').split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-[var(--color-primary-val)] font-black tracking-[0.25em] uppercase mt-1">
                    {(settings?.companyName || settings?.title || settings?.sector || 'Kurumsal Hizmetler').split(' ').slice(1).join(' ') || settings?.sector || 'Kurumsal Hizmetler'}
                  </div>
                </div>
              </>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative" onMouseEnter={() => handleMouseEnter(link.href, link)} onMouseLeave={handleMouseLeave}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black tracking-tight transition-all cursor-pointer ${
                    dropdown === link.href
                      ? 'text-[var(--color-primary-val)] bg-[var(--bg-tertiary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {link.label}
                  {isExpandable(link) && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${
                      dropdown === link.href ? 'rotate-180 text-[var(--color-primary-val)]' : 'text-[var(--text-muted)]'
                    }`} />
                  )}
                </Link>
                {dropdown === link.href && (isServicesHub(link) ? renderServicesMegaMenu() : link.children?.length ? renderSimpleDropdown(link.children) : null)}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {phoneHref && (
              <PhoneLink
                phone={displayPhone}
                href={phoneHref}
                source="navbar-desktop"
                className="hidden lg:flex items-center gap-2.5 px-6 py-2.5 glass rounded-xl text-[13px] font-black text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
              >
                <Phone size={14} className="text-[var(--color-primary-val)]" />
                {displayPhone}
              </PhoneLink>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 glass rounded-2xl text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
              aria-label={isOpen ? 'Menuyu kapat' : 'Menuyu ac'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 h-[100dvh] z-[9998] overflow-y-auto pt-32 pb-20 px-6 flex flex-col gap-4 animate-fade-in"
          style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const expanded = mobileExpanded === link.href;

              return (
                <div key={link.href} className="border-b border-[var(--border-subtle)] last:border-0 text-left">
                  <div className="flex items-center justify-between py-5">
                    <Link href={link.href} onClick={closeMenus} className="text-[18px] font-black text-[var(--text-primary)]">
                      {link.label}
                    </Link>
                    {isExpandable(link) && (
                      <button
                        onClick={() => toggleMobileSection(link.href)}
                        className="p-3 -mr-3 text-[var(--color-primary-val)] bg-[var(--bg-tertiary)] rounded-xl transition-all active:scale-95 cursor-pointer"
                        aria-label={expanded ? `${link.label} bolumunu daralt` : `${link.label} bolumunu genislet`}
                      >
                        <ChevronDown size={20} className={`transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {expanded && (
                    <div className="pb-8 animate-fade-in-small text-left">
                      {isServicesHub(link) ? (
                        <div className="flex flex-col gap-8">
                          {groupedServices.map((group) => (
                            <div key={group.category} className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-[var(--color-primary-val)] uppercase tracking-[0.2em] text-left">
                                  {group.label}
                                </span>
                                <Link href={group.href} onClick={closeMenus} className="text-[11px] font-black text-[var(--text-muted)] flex items-center gap-1">
                                  {navbarUi?.mobileAllLabel} <ArrowRight size={12} />
                                </Link>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {group.services.map((service) => (
                                  <Link
                                    key={service.id}
                                    href={`/hizmetler/${service.slug}`}
                                    onClick={closeMenus}
                                    className="flex items-center justify-between p-4 glass rounded-2xl text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                                  >
                                    {service.title}
                                    <ArrowRight size={14} className="opacity-30" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {link.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMenus}
                              className="text-left p-4 glass rounded-2xl text-[14px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {phoneHref && (
            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] pb-12">
              <PhoneLink
                phone={displayPhone}
                href={phoneHref}
                source="navbar-mobile"
                className="flex items-center justify-center gap-3 p-5 gradient-primary text-white rounded-[24px] text-[15px] font-black uppercase tracking-tight shadow-2xl active:scale-[0.98] transition-transform cursor-pointer"
              >
                <Phone size={20} />
                {displayPhone}
              </PhoneLink>
            </div>
          )}
        </div>
      )}
    </>
  );
}

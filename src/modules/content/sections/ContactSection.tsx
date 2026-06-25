'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import PhoneLink from '@/shared/layout/PhoneLink';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { Branch } from '@/core/types';

interface ContactProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  showForm?: boolean;
  overrideEmail?: string;
  overridePhone?: string;
  overrideAddress?: string;
  overrideMapsLink?: string;
  sectionContent?: any;
}

interface ServiceOption {
  id: string;
  title: string;
  category: string;
}

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  branchId: string;
}

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  branchId: '',
};

export default function ContactSection({
  title,
  subtitle,
  badge,
  showForm = true,
  overridePhone,
  sectionContent,
}: ContactProps) {
  const { settings } = useSettings();
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const contactUi = settings?.uiContent?.contact;
  const finalPhone = overridePhone || settings?.phone || '';
  const finalEmail = settings?.email || '';
  const finalBadge = badge || sectionContent?.badge || contactUi?.badge || '';
  const finalTitle = title || sectionContent?.title || contactUi?.title || '';
  const finalSubtitle = subtitle || sectionContent?.subtitle || contactUi?.subtitle || '';

  const safeFetchJson = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const [branchData, serviceData] = await Promise.all([
        safeFetchJson('/api/locations'),
        safeFetchJson('/api/services'),
      ]);

      if (!isMounted) return;

      if (Array.isArray(branchData)) {
        setBranches(
          branchData.filter(
            (branch): branch is Branch => Boolean(branch?.id && branch?.active)
          )
        );
      }

      if (Array.isArray(serviceData)) {
        setServices(
          serviceData.filter(
            (service): service is ServiceOption =>
              Boolean(service?.id && service?.title)
          )
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryBranch = branches.find((branch) => branch.type === 'merkez') || branches[0];
  const workingHours = primaryBranch?.working_hours?.mon_fri
    ? `${primaryBranch.working_hours.mon_fri.opens || '09:00'} - ${primaryBranch.working_hours.mon_fri.closes || '18:00'}`
    : (settings?.workingHours || '09:00 - 18:00');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let errorData: any;
      try {
        // Clone response to avoid 'body stream already read' issues if we need it later
        const resClone = res.clone();
        errorData = await resClone.json();
      } catch {
        // Ignore JSON parse errors
      }

      if (res.status === 403) {
        throw new Error(errorData?.error || settings?.uiContent?.contact?.errorForbidden || 'Sadece Türkiye içinden başvuru kabul edilmektedir.');
      }
      if (res.status === 400) {
        throw new Error(errorData?.error || settings?.uiContent?.contact?.errorMissingFields || 'Lütfen tüm yıldızlı alanları doldurun.');
      }
      if (!res.ok) {
        throw new Error(errorData?.error || settings?.uiContent?.contact?.errorGeneric || 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }

      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    {
      icon: <Phone size={22} />,
      label: contactUi?.phoneLabel || '',
      value: finalPhone,
      href: finalPhone ? `tel:${finalPhone.replace(/\s/g, '')}` : null,
    },
    {
      icon: <Mail size={22} />,
      label: contactUi?.emailLabel || '',
      value: finalEmail,
      href: finalEmail ? `mailto:${finalEmail}` : null,
    },
    {
      icon: <Clock size={22} />,
      label: contactUi?.hoursLabel || '',
      value: workingHours,
      href: null,
    },
  ];

  return (
    <main className="bg-[#fbfcff] min-h-screen pt-28 pb-32">
      <section className="w-full max-w-[1240px] mx-auto px-4 md:px-6 mb-12 md:mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100/50 rounded-full px-4 py-1.5 mb-6">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{finalBadge}</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black tracking-tighter text-black leading-tight mb-6 uppercase italic">
          {finalTitle.includes('&') ? (
            <>
              {finalTitle.split('&')[0]} <br className="hidden md:block" />
              <span className="text-blue-600/80">{finalTitle.split('&')[1]}</span>
            </>
          ) : finalTitle}
        </h1>
        <p className="text-black/40 text-base md:text-lg font-black uppercase tracking-tight max-w-[700px] mx-auto leading-relaxed">
          {finalSubtitle}
        </p>
      </section>

      <section className="w-full max-w-[1100px] mx-auto px-4 md:px-6 mb-12 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {infoCards.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="group bg-white border border-black/[0.04] p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-500 hover:shadow-2xl hover:border-blue-600/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-blue-100" />
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/[0.02] flex items-center justify-center text-blue-600 mb-4 md:mb-8 transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <p className="text-[9px] md:text-[10px] font-black text-black/20 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 italic">
                {item.label}
              </p>
              {item.href?.startsWith('tel:') ? (
                <PhoneLink phone={item.value} href={item.href} source="contact-info-card" className="text-base md:text-xl font-black text-black tracking-tight uppercase hover:text-blue-600 transition-colors break-all">
                  {item.value}
                </PhoneLink>
              ) : item.href ? (
                <a href={item.href} className="text-base md:text-xl font-black text-black tracking-tight uppercase hover:text-blue-600 transition-colors break-all">
                  {item.value}
                </a>
              ) : (
                <span className="text-base md:text-xl font-black text-black tracking-tight uppercase">
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-[1240px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20">
          <div>
            <div className="mb-8 md:mb-12 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-black mb-4 uppercase px-2">
                {contactUi?.branchesTitle}
              </h2>
              <div className="h-1 w-12 bg-blue-600 rounded-full mx-auto md:mx-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white border border-black/[0.03] p-5 md:p-6 rounded-2xl md:rounded-[32px] transition-all hover:bg-white hover:shadow-xl group h-full flex flex-col"
                >
                  <div className="flex flex-wrap gap-2 justify-between items-center mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <MapPin size={18} />
                    </div>
                    {branch.type === 'merkez' ? (
                      <span className="text-[9px] font-black bg-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {contactUi?.branchCenterBadge || 'MERKEZ'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {settings?.uiContent?.branches?.branchLabel || 'ŞUBE'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-black text-black mb-3 uppercase italic leading-tight">
                    {branch.title}
                  </h3>
                  <p className="text-black/40 text-[10px] md:text-xs font-bold leading-relaxed mb-4 md:mb-5 uppercase tracking-tight px-2 md:px-0 flex-grow">
                    {branch.address}
                  </p>
                  {branch.phone && (
                    <PhoneLink phone={branch.phone} branch={branch} source="contact-branch-card" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black text-blue-600 hover:underline uppercase tracking-widest px-2 md:px-0 mt-auto">
                      {branch.phone} <ArrowRight size={12} className="md:w-[14px]" />
                    </PhoneLink>
                  )}
                </div>
              ))}
            </div>
          </div>

          {showForm && (
            <div className="relative w-full">
              <div className="absolute inset-0 bg-blue-600/5 blur-[120px] -z-10 rounded-full" />
              <div className="bg-white border border-black/[0.05] p-4 md:p-8 lg:p-12 rounded-2xl md:rounded-[40px] shadow-2xl relative overflow-hidden w-full">
                {submitted ? (
                  <div className="text-center py-20 px-4">
                    <CheckCircle2 size={64} className="text-teal mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-black uppercase mb-4">
                      {contactUi?.successTitle || settings?.formSuccessTitle}
                    </h3>
                    <p className="text-black/50 font-medium">
                      {contactUi?.successDescription || settings?.formSuccessDescription}
                    </p>
                    <button onClick={() => setSubmitted(false)} className="mt-8 text-blue-600 font-bold uppercase tracking-widest text-sm hover:underline">
                      {contactUi?.successResetText}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 md:mb-10 text-center">
                      <h2 className="text-xl md:text-3xl font-black tracking-tighter text-black mb-2 md:mb-4 italic uppercase">
                        {contactUi?.formTitle}
                      </h2>
                      <p className="text-black/40 text-xs md:text-sm font-bold leading-relaxed uppercase tracking-wide">
                        {contactUi?.formSubtitle}
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          required
                          type="text"
                          placeholder={contactUi?.namePlaceholder}
                          className="w-full bg-[#f8f9fa] border-none rounded-2xl p-4 md:p-5 text-sm font-bold uppercase tracking-tight placeholder:text-black/20 outline-none focus:ring-2 focus:ring-blue-600/20"
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                        />
                        <input
                          required
                          type="tel"
                          placeholder={contactUi?.phonePlaceholder}
                          className="w-full bg-[#f8f9fa] border-none rounded-2xl p-4 md:p-5 text-sm font-bold uppercase tracking-tight placeholder:text-black/20 outline-none focus:ring-2 focus:ring-blue-600/20"
                          value={form.phone}
                          onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        />
                      </div>
                      <input
                        type="email"
                        placeholder={contactUi?.emailPlaceholder}
                        className="w-full bg-[#f8f9fa] border-none rounded-2xl p-4 md:p-5 text-sm font-bold uppercase tracking-tight placeholder:text-black/20 outline-none focus:ring-2 focus:ring-blue-600/20"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                      />
                      <select
                        className="w-full bg-[#f8f9fa] border-none rounded-2xl p-4 md:p-5 text-sm font-bold uppercase tracking-tight text-black/40 outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
                        value={form.service}
                        onChange={(event) => setForm({ ...form, service: event.target.value })}
                      >
                        <option value="">{contactUi?.servicePlaceholder}</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <textarea
                        required
                        rows={4}
                        placeholder={contactUi?.messagePlaceholder}
                        className="w-full bg-[#f8f9fa] border-none rounded-2xl p-4 md:p-5 text-sm font-bold uppercase tracking-tight placeholder:text-black/20 outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                        value={form.message}
                        onChange={(event) => setForm({ ...form, message: event.target.value })}
                      />
                      {error && <p className="text-red-500 text-xs font-bold uppercase">{error}</p>}
                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-2xl p-5 md:p-6 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        {loading ? contactUi?.submitLoadingText : contactUi?.submitIdleText}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Branch,
  HeroData,
  LegalPage,
  Page,
  Reference,
  SeoData,
  Service,
  ServiceCategory,
  SiteSettings,
  Stat,
  FAQ,
} from '@/core/types';

export interface City {
  id: number;
  name: string;
  slug: string;
  plate_code: string | null;
}

export function useAdminData(tabs: string[] = []): {
  loading: boolean;
  setLoading: (l: boolean) => void;
  settings: SiteSettings | null;
  setSettings: (s: SiteSettings | null) => void;
  services: Service[];
  setServices: (s: Service[]) => void;
  categories: ServiceCategory[];
  setCategories: (c: ServiceCategory[]) => void;
  hero: HeroData | null;
  setHero: (h: HeroData | null) => void;
  references: Reference[];
  setReferences: (r: Reference[]) => void;
  stats: Stat[];
  setStats: (s: Stat[]) => void;
  legal: Record<string, LegalPage> | null;
  setLegal: (l: Record<string, LegalPage> | null) => void;
  seo: Record<string, SeoData> | null;
  setSeo: (s: Record<string, SeoData> | null) => void;
  sections: any[];
  setSections: (s: any[]) => void;
  branches: Branch[];
  setBranches: (b: Branch[]) => void;
  pages: Page[];
  setPages: (p: Page[]) => void;
  faqs: FAQ[];
  setFaqs: (f: FAQ[]) => void;
  sectors: any[];
  setSectors: (s: any[]) => void;
  cities: City[];
  setCities: (c: City[]) => void;
  fetchData: () => Promise<void>;
} {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [hero, setHero] = useState<HeroData | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [legal, setLegal] = useState<Record<string, LegalPage> | null>(null);
  const [seo, setSeo] = useState<Record<string, SeoData> | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tabsQuery = tabs.length > 0 ? `&tabs=${tabs.join(',')}` : '';
      const res = await fetch(`/api/admin/init?t=${Date.now()}${tabsQuery}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Init fetch failed');
      const response = await res.json();
      const data = response.data;
      
      setSettings(data.settings || null);
      setServices(data.services || []);
      setHero(data.hero || null);
      setReferences(data.references || []);
      setStats(data.stats || []);
      setLegal(data.legal || {});
      setSeo(data.seo || {});
      setSections(data.sections || []);
      setBranches(data.branches || []);
      setPages(data.pages || []);
      setCategories(data.categories || []);
      setFaqs(data.faqs || []);
      setSectors(data.sectors || []);
      setCities(data.cities || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const memoTabs = tabs.join(',');

  useEffect(() => {
    void fetchData();
  }, [memoTabs]);

  return {
    loading,
    setLoading,
    settings,
    setSettings,
    services,
    setServices,
    categories,
    setCategories,
    hero,
    setHero,
    references,
    setReferences,
    stats,
    setStats,
    legal,
    setLegal,
    seo,
    setSeo,
    sections,
    setSections,
    branches,
    setBranches,
    pages,
    setPages,
    faqs,
    setFaqs,
    sectors,
    setSectors,
    cities,
    setCities,
    fetchData
  };
}

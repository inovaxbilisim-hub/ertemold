'use client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from './SettingsContext';
import { Branch } from '@/core/types';

interface LocationContextType {
  userCity: string | null;
  activeBranch: Branch | null;
  displayPhone: string;
  displayWhatsApp: string;
}

const LocationContext = createContext<LocationContextType>({
  userCity: null,
  activeBranch: null,
  displayPhone: '',
  displayWhatsApp: ''
});

export const useLocation = () => useContext(LocationContext);

/**
 * Simple cookie helper to read middleware-set values
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Normalizes city names from Geo-Service (English) to Database (Turkish) standard.
 */
function normalizeCity(city: string): string {
  if (!city) return '';
  const cityMap: Record<string, string> = {
    'Izmir': 'İzmir',
    'Istanbul': 'İstanbul',
    'Ankara': 'Ankara',
    'Bursa': 'Bursa',
    'Antalya': 'Antalya',
    'Adana': 'Adana',
    'Konya': 'Konya',
    'Gaziantep': 'Gaziantep',
    'Kocaeli': 'Kocaeli',
    'Mersin': 'Mersin'
  };
  return cityMap[city] || city;
}

/**
 * Standardizes a string for localized comparison.
 */
function standardize(str: string): string {
  return str.toLocaleLowerCase('tr-TR').trim();
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [userCity, setUserCity] = useState<string | null>(null);
  const pathname = usePathname();

  const globalPhone = settings?.phone || '';
  const globalWhatsApp = settings?.whatsapp || globalPhone;

  const isAdmin = pathname.startsWith('/admin');

  // 1. PHASE: Geo-IP Detection (Proactive, runs once per session)
  useEffect(() => {
    if (isAdmin) return;

    async function detectLocation() {
      const service = settings?.geoService || 'vercel';
      if (service === 'none') {
        return;
      }

      // 1. Simulation Check (Development/Testing Override)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const simCity = urlParams.get('simulate');
        if (simCity) {
          const normalized = normalizeCity(simCity);
          setUserCity(normalized);
          try { window.sessionStorage.setItem('wl_detected_city', normalized); } catch {}
          return;
        }
      }

      // 2. Cache Check (Prevents multiple API calls in same session)
      const cached = typeof window !== 'undefined' ? window.sessionStorage.getItem('wl_detected_city') : null;
      if (cached) {
        setUserCity(cached);
        return;
      }

      // 3. Vercel Cookie Check (Highest Priority if using vercel service)
      if (service === 'vercel') {
        const edgeCity = getCookie('vercel-geo-city');
        if (edgeCity) {
          const normalized = normalizeCity(decodeURIComponent(edgeCity));
          setUserCity(normalized);
          try { window.sessionStorage.setItem('wl_detected_city', normalized); } catch {}
          return;
        }
      }

      const runDetection = async () => {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 2500);
        try {
          // Using ipapi.co as the primary Geo-Service
          const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
          if (!res.ok) {
            console.warn("📍 Geo-Service: IP tespiti başarısız (HTTP " + res.status + ")");
            return;
          }
          const data = await res.json();
          if (data && data.city) {
            const normalized = normalizeCity(data.city);
            setUserCity(normalized);
            try { window.sessionStorage.setItem('wl_detected_city', normalized); } catch {}
          } else {
            console.warn("📍 Geo-Service: Yanıt içeriği eksik", data);
          }
        } catch (error) {
          if ((error as any)?.name !== 'AbortError') {
            console.warn("Geo-Service Hatası:", error);
          } else {
            console.warn("📍 Geo-Service: Zaman aşımı (2.5s)");
          }
        } finally {
          clearTimeout(timeout);
        }
      };

      // Perform detection with a slight delay to prioritize LCP
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => runDetection(), { timeout: 3000 });
      } else {
        setTimeout(runDetection, 1000);
      }
    }

    if (settings?.branches?.length) {
      detectLocation();
    }
  }, [settings, isAdmin]);

  const urlCitySlug = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    return lastSegment.includes('-') ? lastSegment.split('-')[0] : lastSegment;
  }, [pathname]);

  // 2. PHASE: Active Branch Resolution (Hierarchy Rule: URL > Geo-IP > Fallback)
  const activeBranch = useMemo(() => {
    if (!settings?.branches) return null;

    let target: Branch | null = null;
    const branches = settings.branches.filter(b => b.active);

    if (urlCitySlug) {
      target = branches.find(b => b.city_slug === urlCitySlug) || null;
    }

    // [HIERARCHY 2] Geo-IP Match (If no URL override)
    if (!target && userCity) {
      const q = standardize(userCity);
      target = branches.find(b => 
        (b.city_name && standardize(b.city_name) === q) ||
        (b.title && standardize(b.title).includes(q))
      ) || null;
    }

    // [HIERARCHY 3] Default Fallback (Merkez)
    if (!target) {
      target = branches.find(b => b.type === 'merkez') || branches[0] || null;
    }

    return target;
  }, [userCity, settings, urlCitySlug]);

  // Derived communication values
  const displayPhone = activeBranch?.phone || globalPhone;
  // If branch is active, use its phone as WhatsApp proxy (modular improvement could add specific field)
  const displayWhatsApp = activeBranch?.phone ? activeBranch.phone : globalWhatsApp;

  return (
    <LocationContext.Provider value={{ userCity, activeBranch, displayPhone, displayWhatsApp }}>
      {children}
    </LocationContext.Provider>
  );
}




'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

import { SiteSettings } from '@/core/types';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children, initialData }: { children: React.ReactNode, initialData?: SiteSettings | null }) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Settings fetch failed with status ${res.status}`);
      }

      const data = await res.json();
      if (isMounted.current) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!initialData) {
      void fetchSettings();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchSettings, initialData]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}


'use client';
import { ThemeProvider } from '@/shared/layout/ThemeProvider';
import { SettingsProvider } from '@/modules/settings/context/SettingsContext';
import { LocationProvider } from '@/modules/settings/context/LocationContext';
import type { SiteSettings } from '@/core/types';

type ThemeSettings = Record<string, unknown>;

interface ProvidersProps {
  children: React.ReactNode;
  settings: SiteSettings | null;
  activeTheme: string;
  themeSettings: ThemeSettings;
  isAdmin: boolean;
}

export function Providers({ children, settings, activeTheme, themeSettings, isAdmin }: ProvidersProps) {
  if (isAdmin) {
    return <SettingsProvider initialData={settings}>{children}</SettingsProvider>;
  }
  return (
    <ThemeProvider activeTheme={activeTheme} themeSettings={themeSettings}>
      <SettingsProvider initialData={settings}>
        <LocationProvider>
          {children}
        </LocationProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

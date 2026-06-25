'use client';

import { useLayoutEffect } from 'react';
import { THEME_REGISTRY } from '@/core/registry/theme';
import { applyThemeSettings } from '@/core/registry/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  activeTheme?: string;
  themeSettings?: Record<string, unknown>;
}

// Synchronous module-level init — runs during module evaluation (BEFORE any render)
// This ensures HookRegistry filters are registered before BlockRenderer renders on client
if (typeof window !== 'undefined') {
  const theme = document.documentElement.getAttribute('data-active-theme') as keyof typeof THEME_REGISTRY;
  if (theme && theme !== 'default' && THEME_REGISTRY[theme]) {
    THEME_REGISTRY[theme]().then((themeModule) => {
      if (themeModule.initTheme) {
        themeModule.initTheme();
      } else if (themeModule.register) {
        themeModule.register();
      }
    }).catch(err => console.error('Failed to load theme dynamically on client', err));
  }
}

export function ThemeProvider({ children, activeTheme, themeSettings = {} }: ThemeProviderProps) {
  useLayoutEffect(() => {
    try {
      // Apply theme CSS variables from settings
      if (activeTheme && activeTheme !== 'default' && Object.keys(themeSettings).length > 0) {
        applyThemeSettings(themeSettings as Record<string, any>);
      }

      // Dark/light mode
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const theme = storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : (prefersDark ? 'dark' : 'light');

      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch {
      // ignore errors during theme bootstrapping
    }
  }, [activeTheme, themeSettings]);

  return <>{children}</>;
}

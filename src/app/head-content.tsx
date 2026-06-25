import { ThemeLoader } from '@/core/hooks/ThemeLoader';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { renderInjectedHtml } from '@/modules/settings/lib/code-injection';
import type { LayoutData } from './layout-data';

export function HeadContent({ data }: { data: LayoutData }) {
  const { activeTheme, headActive, settings } = data;
  return (
    <head>
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      {headActive && renderInjectedHtml(settings?.codeInjection?.headCode, 'custom-head-code', null)}
      {HookRegistry.applyFilters('head_elements', [])}
      {HookRegistry.applyFilters('core:head', [])}
      {activeTheme !== 'default' && <ThemeLoader activeTheme={activeTheme} />}
    </head>
  );
}

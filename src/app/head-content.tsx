import { ThemeLoader } from '@/core/hooks/ThemeLoader';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { renderInjectedHtml } from '@/modules/settings/lib/code-injection';
import type { LayoutData } from './layout-data';

export function HeadContent({ data }: { data: LayoutData }) {
  const { isPublicPage, activeTheme, headActive, settings } = data;
  return (
    <head>
      <link rel="preconnect" href="https://res.cloudinary.com" />
      {isPublicPage && <link rel="preconnect" href="https://www.googletagmanager.com" />}
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      {isPublicPage && <link rel="dns-prefetch" href="https://www.googletagmanager.com" />}
      {headActive && renderInjectedHtml(settings?.codeInjection?.headCode, 'custom-head-code', null)}
      {isPublicPage && HookRegistry.applyFilters('head_elements', [])}
      {isPublicPage && HookRegistry.applyFilters('core:head', [])}
      {isPublicPage && activeTheme !== 'default' && <ThemeLoader activeTheme={activeTheme} />}
    </head>
  );
}

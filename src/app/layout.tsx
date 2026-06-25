import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MetaGenerator } from "@/domains/seo-engine";
import AnalyticsTracker from '@/modules/analytics/components/AnalyticsTracker';
import WebVitals from '@/modules/analytics/components/WebVitals';
import { HookRegistry } from "@/core/hooks/HookRegistry";
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { fetchLayoutData } from './layout-data';
import { HeadContent } from './head-content';
import { BodyStartContent, BodyEndContent } from './body-content';
import { Providers } from './providers';
import { getNavbar, getFooter, getAnnouncementBar } from './layout-components';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const WhatsAppButtonLazy = dynamic(() => import('@/shared/layout/WhatsAppButton'), {
  loading: () => null,
});

const ToasterClient = dynamic(() => import('@/shared/layout/SonnerToaster'), {
  loading: () => null,
});

export async function generateMetadata(): Promise<Metadata> {
  return MetaGenerator.generate();
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await fetchLayoutData();
  const { locale, activeTheme, settings } = data;

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth" data-active-theme={activeTheme}
      className={`${inter.variable} theme-${activeTheme}`}>
      <HeadContent data={data} />
      <body suppressHydrationWarning className={`theme-${activeTheme}`}>
        <a href="#main-content" className="skip-navigation">
          Ana içeriğe geç
        </a>
        <BodyStartContent data={data} />
        {data.themeVarsCSS && (
          <style
            dangerouslySetInnerHTML={{
              __html: `:root {\n${data.themeVarsCSS}\n}`
            }}
          />
        )}
        <Providers settings={settings} activeTheme={activeTheme} themeSettings={data.themeSettings} isAdmin={false}>
          <ToasterClient />
          {children}
        </Providers>
        {HookRegistry.applyFilters('core:footer', [])}
        <BodyEndContent data={data} />
      </body>
    </html>
  );
}

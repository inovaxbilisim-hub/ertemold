import React from 'react';
import dynamic from 'next/dynamic';
import AnalyticsTracker from '@/modules/analytics/components/AnalyticsTracker';
import WebVitals from '@/modules/analytics/components/WebVitals';
import { getNavbar, getFooter, getAnnouncementBar } from '@/app/layout-components';
import { getServices, getServiceCategories, getAppearanceTheme } from '@/lib/data';

const WhatsAppButtonLazy = dynamic(() => import('@/shared/layout/WhatsAppButton'), {
  loading: () => null,
});

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navServices, navCategories, activeTheme] = await Promise.all([
    getServices().catch(() => []),
    getServiceCategories().catch(() => []),
    getAppearanceTheme().catch(() => 'default'),
  ]);

  const Navbar = await getNavbar(activeTheme);
  const Footer = await getFooter(activeTheme);
  const AnnouncementBar = await getAnnouncementBar(activeTheme);

  return (
    <>
      <AnalyticsTracker />
      <WebVitals />
      <AnnouncementBar />
      <Navbar initialServices={navServices} initialCategories={navCategories} />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppButtonLazy />
    </>
  );
}

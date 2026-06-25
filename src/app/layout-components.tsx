/**
 * Layout Components with Theme Override Support
 * Bu dosya tema template override sistemini destekler
 */

import { resolveTemplate } from '@/core/templates/TemplateResolver';
import DefaultNavbar from '@/shared/layout/Navbar';
import DefaultFooter from '@/shared/layout/Footer';
import DefaultAnnouncementBar from '@/shared/layout/AnnouncementBar';

/**
 * Navbar component'i tema override ile yükle
 */
export async function getNavbar(activeTheme: string) {
  if (activeTheme === 'default') {
    return DefaultNavbar;
  }
  
  const ThemeNavbar = await resolveTemplate(
    'Navbar',
    activeTheme,
    'shared/layout/Navbar'
  );
  
  return ThemeNavbar || DefaultNavbar;
}

/**
 * Footer component'i tema override ile yükle
 */
export async function getFooter(activeTheme: string) {
  if (activeTheme === 'default') {
    return DefaultFooter;
  }
  
  const ThemeFooter = await resolveTemplate(
    'Footer',
    activeTheme,
    'shared/layout/Footer'
  );
  
  return ThemeFooter || DefaultFooter;
}

/**
 * AnnouncementBar component'i tema override ile yükle
 */
export async function getAnnouncementBar(activeTheme: string) {
  if (activeTheme === 'default') {
    return DefaultAnnouncementBar;
  }
  
  const ThemeAnnouncementBar = await resolveTemplate(
    'AnnouncementBar',
    activeTheme,
    'shared/layout/AnnouncementBar'
  );
  
  return ThemeAnnouncementBar || DefaultAnnouncementBar;
}

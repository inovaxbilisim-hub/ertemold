'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useLocation } from '@/modules/settings/context/LocationContext';

interface PhoneBranchInfo {
  id?: string;
  title?: string;
  city_name?: string;
  city_slug?: string;
  type?: string;
}

interface PhoneLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  phone: string;
  children: ReactNode;
  branch?: PhoneBranchInfo | null;
  href?: string;
  source?: string;
}

export default function PhoneLink({
  phone,
  children,
  branch,
  href,
  source = 'phone-link',
  onClick,
  ...rest
}: PhoneLinkProps) {
  const pathname = usePathname();
  const { activeBranch, userCity } = useLocation();

  const resolvedBranch = branch ?? activeBranch;
  const normalizedPhone = phone.replace(/\s/g, '');
  const linkHref = href || `tel:${normalizedPhone}`;

  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'] = (event) => {
    onClick?.(event);

    if (event.defaultPrevented || !phone) {
      return;
    }

    let detectedCitySlug = '';
    let detectedCityName = '';
    let detectedBranchId = '';
    let detectedBranchTitle = '';

    // ALWAYS use the detected city name from the Geo-IP service (userCity from LocationContext) if available!
    if (userCity) {
      const slugMap: Record<string, string> = {
        'İstanbul': 'istanbul',
        'Ankara': 'ankara',
        'İzmir': 'izmir',
        'Bursa': 'bursa',
        'Antalya': 'antalya',
        'Kocaeli': 'kocaeli',
        'Adana': 'adana',
        'Konya': 'konya',
        'Gaziantep': 'gaziantep',
        'Mersin': 'mersin'
      };
      const matchedSlug = slugMap[userCity] || userCity.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      detectedCityName = userCity;
      detectedCitySlug = matchedSlug;
      
      // If we have a physical branch matching this detected city, we associate it
      if (activeBranch && activeBranch.city_name && activeBranch.city_name.toLowerCase() === userCity.toLowerCase()) {
        detectedBranchId = activeBranch.id || '';
        detectedBranchTitle = activeBranch.title || '';
      }
    } else {
      // Fallback to active branch (Vercel edge cookie / default branch fallback) if Geo-IP is not loaded yet or disabled
      detectedCitySlug = resolvedBranch?.city_slug || '';
      detectedCityName = resolvedBranch?.city_name || '';
      detectedBranchId = resolvedBranch?.id || '';
      detectedBranchTitle = resolvedBranch?.title || '';
    }

    const payload = JSON.stringify({
      phone,
      path: pathname || '/',
      source,
      branchId: detectedBranchId,
      branchTitle: detectedBranchTitle,
      cityName: detectedCityName,
      citySlug: detectedCitySlug,
    });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const body = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/phone-click', body);
      return;
    }

    void fetch('/api/analytics/phone-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  };

  return (
    <a {...rest} href={linkHref} onClick={handleClick}>
      {children}
    </a>
  );
}

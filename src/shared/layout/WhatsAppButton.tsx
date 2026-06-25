'use client';

import { MessageCircle } from 'lucide-react';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { useLocation } from '@/modules/settings/context/LocationContext';

import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const { displayWhatsApp, activeBranch } = useLocation();
  const pathname = usePathname();

  // Settings tabanlı gizleme kontrolü (varsayılan true)
  if (settings?.showWhatsApp === false) return null;

  const phoneNumber = displayWhatsApp || settings?.whatsapp;
  
  // Don't render if no WhatsApp number is configured
  if (!phoneNumber) return null;
  
  const message = encodeURIComponent('Merhaba, sitemiz üzerinden sizinle iletişime geçiyorum.');
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;

  const handleClick = () => {
    fetch('/api/analytics/phone-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        path: pathname,
        source: 'whatsapp',
        branchId: activeBranch?.id,
        branchTitle: activeBranch?.title,
        cityName: activeBranch?.city_name,
        citySlug: activeBranch?.city_slug
      }),
      keepalive: true
    }).catch(() => {});
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="WhatsApp'tan iletişime geçin"
      onClick={handleClick}
    >
      <div className="whatsapp-icon-wrapper">
        <MessageCircle size={28} fill="currentColor" />
      </div>
    </a>
  );
}

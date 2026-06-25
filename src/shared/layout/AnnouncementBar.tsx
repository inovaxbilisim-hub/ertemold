'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/modules/settings/context/SettingsContext';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (settings?.announcement?.active) {
      const isDismissed = sessionStorage.getItem('announcement-dismissed');
      if (!isDismissed) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [settings]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (settings?.announcement?.dismissible) {
      sessionStorage.setItem('announcement-dismissed', 'true');
    }
  };

  if (!isVisible || !settings?.announcement) return null;

  const { text, bgColor, textColor, link, linkText } = settings.announcement;

  return (
    <div
      style={{
        backgroundColor: bgColor || 'var(--accent-blue)',
        color: textColor || '#ffffff',
        padding: '8px 16px',
        position: 'relative',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 500,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>{text}</span>
        {link && (
          <Link
            href={link}
            style={{
              color: 'inherit',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
            }}
          >
            {linkText || 'İncele'}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
      
      {settings.announcement.dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

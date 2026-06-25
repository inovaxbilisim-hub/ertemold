'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Shield } from 'lucide-react';
import { useSettings } from '@/modules/settings/context/SettingsContext';

export default function NotFound() {
  const { settings } = useSettings();
  const brandName = settings?.companyName || settings?.title || 'Web Platformu';
  const notFoundUi = settings?.uiContent.notFound;

  return (
    <div className="notfound-page">
      <div className="notfound-bg-1" />
      <div className="notfound-bg-2" />

      <div className="notfound-content">
        <div className="notfound-icon-wrapper">
          <Shield size={40} className="notfound-icon" />
        </div>

        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">{notFoundUi?.title}</h2>
        <p className="notfound-description">
          {notFoundUi?.description}
        </p>

        <div className="notfound-actions">
          <button onClick={() => window.history.back()} className="btn-notfound-back">
            <ArrowLeft size={18} /> {notFoundUi?.backLabel}
          </button>

          <Link href="/" className="btn-notfound-home">
            <Home size={18} /> {notFoundUi?.homeLabel}
          </Link>
        </div>
      </div>

      <p className="notfound-footer">© {new Date().getFullYear()} {brandName}</p>
    </div>
  );
}

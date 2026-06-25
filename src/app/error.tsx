'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/modules/settings/context/SettingsContext';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { settings } = useSettings();
  const errorUi = settings?.uiContent.error;

  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Runtime Error:', error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon-wrapper">
          <AlertCircle size={40} className="error-icon" />
        </div>

        <h1 className="error-title">
          {errorUi?.title}
        </h1>

        <p className="error-description">
          {errorUi?.description}
        </p>

        <div className="error-actions">
          <button onClick={reset} className="btn-error-retry">
            <RefreshCw size={18} /> {errorUi?.retryLabel}
          </button>

          <Link href="/" className="btn-error-home">
            <Home size={18} /> {errorUi?.homeLabel}
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="error-dev-info">
            <p className="error-dev-label">Geliştirici Notu (Sadece Geliştirmede Görünür):</p>
            <code className="error-dev-message">{(error instanceof Error ? error.message : String(error))}</code>
          </div>
        )}
      </div>
    </div>
  );
}

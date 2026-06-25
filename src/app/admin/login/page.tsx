'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useSettings } from '@/modules/settings/context/SettingsContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(false);
  const { settings } = useSettings();
  const adminUi = settings?.uiContent?.admin;
  const panelName = settings?.companyName || adminUi?.loginTitle || 'Yönetim Paneli';
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    usernameRef.current?.focus();
    return () => { mountedRef.current = false; };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username || undefined, password }),
    });

    setLoading(false);

    if (response.ok) {
      if (mountedRef.current) {
        window.location.href = '/admin';
      }
      return;
    }

    setError(adminUi?.loginErrorText || 'Hatalı şifre. Lütfen tekrar deneyin.');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={24} color="#fff" />
          </div>
          <h1 className="admin-login-title">{panelName}</h1>
          <p className="admin-login-subtitle">{adminUi?.loginSubtitle || 'Yönetim paneline erişmek için giriş yapın'}</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="admin-login-field">
            <label className="admin-login-label">{adminUi?.usernameLabel || 'Kullanıcı Adı'}</label>
            <div className="admin-login-input-wrapper">
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={adminUi?.usernamePlaceholder || 'Kullanıcı adınızı girin'}
                className="admin-login-input"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label className="admin-login-label">{adminUi?.passwordLabel || 'Şifre'}</label>
            <div className="admin-login-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={adminUi?.passwordPlaceholder || 'Şifrenizi girin'}
                required
                className={`admin-login-input ${error ? 'admin-login-input-error' : ''}`}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="admin-login-toggle-btn">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" disabled={loading} className={`admin-login-submit ${loading ? 'admin-login-submit-loading' : ''}`}>
            {loading
              ? (adminUi?.loginSubmittingText || 'Giriş yapılıyor...')
              : (adminUi?.loginSubmitText || 'Giriş Yap')}
          </button>
        </form>
      </div>
    </div>
  );
}

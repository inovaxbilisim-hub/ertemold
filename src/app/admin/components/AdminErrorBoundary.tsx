'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AlertOctagon size={32} />
            </div>
            
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              Bir Hata Oluştu
            </h1>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              Bu panel yüklenirken beklenmeyen bir hata meydana geldi. Sayfayı yenileyerek tekrar deneyebilirsiniz.
            </p>

            {this.state.error && (
              <pre style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#ef4444',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '24px',
                maxHeight: '120px'
              }}>
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #00d4aa, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <RotateCcw size={16} />
              Yeniden Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

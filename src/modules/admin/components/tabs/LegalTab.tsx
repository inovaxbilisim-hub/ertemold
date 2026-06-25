'use client';

import type { LegalPage } from '@/core/types';
import LegalTabSections from './legal/LegalTabSections';

interface LegalTabProps {
  legal: Record<string, LegalPage> | null;
  saving: boolean;
  onUpdate: (data: Record<string, LegalPage>) => void;
  onSave: () => void;
}

export default function LegalTab({ legal, saving, onUpdate, onSave }: LegalTabProps) {
  if (!legal) {
    return null;
  }

  return (
    <div className="admin-card">
      <div className="admin-toolbar">
        <div />
        <button onClick={onSave} className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Yasal Sayfalari Kaydet'}
        </button>
      </div>

      <LegalTabSections legal={legal} onUpdate={onUpdate} />
    </div>
  );
}

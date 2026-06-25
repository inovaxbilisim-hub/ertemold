'use client';

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

interface UniversalIconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

// A large but curated list of icons useful for the platform
const SUGGESTED_ICONS = [
  'Shield', 'ShieldCheck', 'ShieldAlert', 'Lock', 'KeyRound', 'Fingerprint', 'Eye', 'EyeOff',
  'Monitor', 'Smartphone', 'Tablet', 'Laptop', 'Server', 'Database', 'HardDrive', 'Cpu',
  'Network', 'Wifi', 'Globe', 'Cloud', 'CloudLightning', 'Zap', 'Activity', 'BarChart3',
  'Camera', 'Video', 'Mic', 'Speaker', 'Headphones', 'Bell', 'Mail', 'MessageSquare',
  'Settings', 'Wrench', 'Hammer', 'Construction', 'Truck', 'Box', 'Layers', 'Layout',
  'Search', 'ZoomIn', 'ZoomOut', 'Filter', 'List', 'Grid', 'Menu', 'MoreHorizontal',
  'Plus', 'Minus', 'Check', 'X', 'AlertTriangle', 'Info', 'HelpCircle', 'ExternalLink',
  'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronLeft', 'Play', 'Pause', 'Square',
  'Home', 'User', 'Users', 'Briefcase', 'Building2', 'MapPin', 'Calendar', 'Clock'
];

export default function UniversalIconPicker({ value, onChange }: UniversalIconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = searchTerm 
    ? SUGGESTED_ICONS.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    : SUGGESTED_ICONS;

  return (
    <div className="admin-icon-picker">
      <div className="admin-icon-picker-header" style={{ marginBottom: '16px' }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
            placeholder="Ikon ara (örn: Shield, Monitor)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-icon-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', 
        gap: '8px',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '4px',
        background: 'var(--bg-primary)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {filteredIcons.map((name) => {
          const Icon = (Icons as any)[name] || Icons.HelpCircle;
          const isActive = value === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`admin-icon-btn ${isActive ? 'active' : ''}`}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0
              }}
              title={name}
            >
              <Icon size={20} />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
            Ikon bulunamadi.
          </div>
        )}
      </div>
      
      {value && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Secili:</span>
          <code style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{value}</code>
        </div>
      )}
    </div>
  );
}

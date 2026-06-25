'use client';

import type { ReactNode } from 'react';
import AdminImagePicker from '@/modules/admin/components/AdminImagePicker';

export interface FieldConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'password' | 'number';
  spanFull?: boolean;
}

export function SettingsPanel({ title, children, fullWidth = false }: { title: string; children: ReactNode; fullWidth?: boolean }) {
  return (
    <section className={fullWidth ? 'admin-settings-panel admin-settings-panel-full' : 'admin-settings-panel'}>
      <h4 className="admin-settings-section-title">{title}</h4>
      {children}
    </section>
  );
}

export function SettingsCard({ title, children, fullWidth = false }: { title: string; children: ReactNode; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'admin-card admin-settings-subcard admin-settings-subcard-full' : 'admin-card admin-settings-subcard'}>
      <h5 className="admin-settings-card-title">{title}</h5>
      {children}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, multiline = false, rows = 3, type = 'text', spanFull = false }: FieldConfig) {
  return (
    <div className={spanFull ? 'admin-form-group admin-settings-field-full' : 'admin-form-group'}>
      <label className="admin-label">{label}</label>
      {multiline ? (
        <textarea className="admin-textarea" rows={rows} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="admin-input" type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="admin-settings-toggle" htmlFor={id}>
      <input 
        id={id} 
        type="checkbox" 
        checked={checked} 
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)} 
      />
      {label && <span className="admin-settings-label-inline">{label}</span>}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>
      <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ImagePathField({
  label,
  pickerLabel,
  value,
  onChange,
}: {
  label: string;
  pickerLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>
      <div className="admin-settings-picker">
        <AdminImagePicker value={value} onChange={onChange} label={pickerLabel} />
      </div>
      <input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function renderFields(fields: FieldConfig[]) {
  return fields.map((field) => (
    <TextField
      key={field.label}
      label={field.label}
      value={field.value}
      onChange={field.onChange}
      multiline={field.multiline}
      rows={field.rows}
      type={field.type}
      spanFull={field.spanFull}
    />
  ));
}

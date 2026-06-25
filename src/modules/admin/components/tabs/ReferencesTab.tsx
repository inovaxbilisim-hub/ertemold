'use client';

import type { Reference } from '@/core/types';
import ReferencesTabSections from './references/ReferencesTabSections';

interface ReferencesTabProps {
  references: Reference[];
  onEdit: (ref: Reference) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggleActive: (ref: Reference) => Promise<void>;
}

export default function ReferencesTab({ references, onEdit, onDelete, onCreate, onToggleActive }: ReferencesTabProps) {
  return <ReferencesTabSections references={references} onEdit={onEdit} onDelete={onDelete} onCreate={onCreate} onToggleActive={onToggleActive} />;
}

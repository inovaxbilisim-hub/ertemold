import { dbRun } from '@/core/database/db';

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'reset' | 'settings_update';
export type AuditEntity = 'settings' | 'service' | 'sector' | 'reference' | 'page' | 'legal' | 'faq' | 'city' | 'branch' | 'session' | 'seo' | 'analytics' | 'media' | 'section_content' | 'config_module' | 'location_metadata' | 'pseo' | 'login';

export type AuditDetails = Record<string, unknown>;

export async function auditLog(params: {
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string;
  actor?: string;
  details?: AuditDetails;
  ip_address?: string;
}): Promise<void> {
  try {
    await dbRun(
      `INSERT INTO audit_log (action, entity, entity_id, actor, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.action,
        params.entity,
        params.entity_id || null,
        params.actor || 'admin',
        JSON.stringify(params.details || {}),
        params.ip_address || null,
      ]
    );
  } catch (err) {
    console.error('[auditLog] Failed to write audit entry:', err);
  }
}

'use client';

import { useState, useEffect, useCallback } from 'react';

const ENTITY_API_MAP: Record<string, string> = {
  'faq': '/api/admin/faq',
  'branch': '/api/admin/branches',
  'service-category': '/api/admin/service-categories',
  'project': '/api/admin/references', // backward compatible alias
  'review': '/api/admin/reviews',
  'section-content': '/api/admin/section-content',
  'location-metadata': '/api/admin/location-metadata',
  'legal': '/api/admin/legal',
  'hero': '/api/admin/hero',
};

export function useEntities<T = any>(entityType: string | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!entityType) {
      setData([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = ENTITY_API_MAP[entityType] || `/api/admin/${entityType}`;
      const res = await fetch(baseUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed');
      const result = await res.json();
      
      // Handle different API response formats
      let rows: any[] = [];
      if (Array.isArray(result)) {
        rows = result;
      } else if (result.data && Array.isArray(result.data)) {
        rows = result.data;
      } else if (result.data && typeof result.data === 'object') {
        // Handle object formats like legal pages
        rows = Object.keys(result.data).map(key => ({ id: key, ...result.data[key] }));
      } else if (result && typeof result === 'object' && !result.success && !result.error) {
         rows = Object.keys(result).map(key => ({ id: key, ...result[key] }));
      }

      setTotal(result.total || rows.length);
      setData(rows as T[]);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [entityType]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(async (body: Record<string, unknown>) => {
    if (!entityType) return null;
    const baseUrl = ENTITY_API_MAP[entityType] || `/api/admin/${entityType}`;
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Create failed');
    await fetchAll();
    return res.json();
  }, [entityType, fetchAll]);

  const update = useCallback(async (id: string | number, body: Record<string, unknown>) => {
    if (!entityType) return null;
    const baseUrl = ENTITY_API_MAP[entityType] || `/api/admin/${entityType}`;
    const res = await fetch(baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, id }),
    });
    if (!res.ok) throw new Error('Update failed');
    await fetchAll();
    return res.json();
  }, [entityType, fetchAll]);

  const remove = useCallback(async (id: string | number) => {
    if (!entityType) return null;
    const baseUrl = ENTITY_API_MAP[entityType] || `/api/admin/${entityType}`;
    const res = await fetch(`${baseUrl}?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    await fetchAll();
    return res.json();
  }, [entityType, fetchAll]);

  return { data, setData, loading, error, total, refetch: fetchAll, create, update, remove };
}


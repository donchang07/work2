'use client';
import { useCallback, useEffect, useState } from 'react';

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) } });
  if (res.status === 401) { window.location.href = `/login?reason=expired&next=${encodeURIComponent(location.pathname + location.search)}`; throw new Error('expired'); }
  if (res.status === 403) { window.location.href = '/forbidden'; throw new Error('forbidden'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(j.message || j.error || '일시적인 오류입니다. 잠시 후 다시 시도하세요.') as Error & { status?: number; code?: string }; e.status = res.status; e.code = j.error; throw e; }
  return j as T;
}
export const post = <T,>(url: string, data?: unknown) => apiFetch<T>(url, { method: 'POST', body: JSON.stringify(data ?? {}) });

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError(null);
    try { setData(await apiFetch<T>(url)); } catch (e) { if (!['expired', 'forbidden'].includes((e as Error).message)) setError('일시적인 오류입니다. 잠시 후 다시 시도하세요.'); }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { void load(); }, [load]);
  return { data, error, loading, reload: load, setData };
}
export const SYS_ERR = '일시적인 오류입니다. 잠시 후 다시 시도하세요.';
export const fmtEok = (krw: number) => `${(krw / 1e8).toFixed(1)}억`;

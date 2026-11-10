import type { Account, Alias } from './types';

export function normalizeName(s: string): string {
  return s
    .replace(/\(주\)|㈜|주식회사|유한회사|\(유\)|co\.,?\s*ltd\.?|inc\.?|corp\.?/gi, '')
    .replace(/[\s()[\]{}.,·\-_/]/g, '')
    .toLowerCase();
}

export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const am = new Array(a.length).fill(false), bm = new Array(b.length).fill(false);
  let m = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = Math.max(0, i - range); j < Math.min(b.length, i + range + 1); j++) {
      if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break; }
    }
  }
  if (!m) return 0;
  let t = 0, k = 0;
  for (let i = 0; i < a.length; i++) if (am[i]) { while (!bm[k]) k++; if (a[i] !== b[k]) t++; k++; }
  const jaro = (m / a.length + m / b.length + (m - t / 2) / m) / 3;
  let p = 0; while (p < 4 && p < a.length && p < b.length && a[p] === b[p]) p++;
  return jaro + p * 0.1 * (1 - jaro);
}

export interface MatchResult { account_id: number | null; score: number; status: 'auto' | 'candidate' | 'new'; candidates: { account_id: number; score: number }[]; exact: boolean }

/** 11.8 기관명 매칭: 승인 별칭·고객명 정확 일치 1.0, 아니면 Jaro-Winkler 최댓값 */
export function matchOrg(raw: string, accounts: Pick<Account, 'id' | 'name' | 'status'>[], aliases: Alias[]): MatchResult {
  const n = normalizeName(raw);
  const active = accounts.filter(a => a.status === 'active');
  const activeIds = new Set(active.map(a => a.id));
  const names: { account_id: number; norm: string }[] = [
    ...active.map(a => ({ account_id: a.id, norm: normalizeName(a.name) })),
    ...aliases.filter(al => activeIds.has(al.account_id)).map(al => ({ account_id: al.account_id, norm: normalizeName(al.alias) })),
  ];
  const exact = names.find(x => x.norm === n);
  if (exact) return { account_id: exact.account_id, score: 1, status: 'auto', candidates: [{ account_id: exact.account_id, score: 1 }], exact: true };
  const best = new Map<number, number>();
  for (const x of names) { const s = jaroWinkler(n, x.norm); if (s > (best.get(x.account_id) ?? 0)) best.set(x.account_id, s); }
  const ranked = [...best.entries()].map(([account_id, score]) => ({ account_id, score: Math.round(score * 1000) / 1000 })).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (!top) return { account_id: null, score: 0, status: 'new', candidates: [], exact: false };
  const status = classify(top.score);
  return { account_id: status === 'auto' ? top.account_id : null, score: top.score, status, candidates: ranked.filter(r => r.score >= 0.6).slice(0, 3), exact: false };
}
export function classify(score: number): 'auto' | 'candidate' | 'new' {
  return score >= 0.85 ? 'auto' : score >= 0.6 ? 'candidate' : 'new';
}

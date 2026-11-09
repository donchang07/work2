import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { accountQualityMap, scopedAccounts, scopeFor, today } from '@/lib/repo';
import { normalizeName } from '@/lib/domain/names';
import { monthOf } from '@/lib/time';
export const dynamic = 'force-dynamic';
export const GET = handle(async (req: Request) => {
  const u = await requireApiUser();
  const db = getDb();
  const scope = scopeFor(u);
  const sp = new URL(req.url).searchParams;
  const q = normalizeName(sp.get('q') ?? '');
  const seg = sp.get('segment') ?? '';
  const accounts = scopedAccounts(db, scope);
  const aliases = db.prepare('SELECT account_id, alias FROM account_aliases').all() as { account_id: number; alias: string }[];
  const from = monthOf(today(), 11);
  const rev = new Map((db.prepare('SELECT account_id, sum(amount_krw) s FROM orders WHERE order_month >= ? GROUP BY account_id').all(from) as { account_id: number; s: number }[]).map(r => [r.account_id, r.s]));
  const risk = new Map((db.prepare('SELECT account_id, score, grade FROM risk_scores').all() as { account_id: number; score: number; grade: string }[]).map(r => [r.account_id, r]));
  const owners = new Map((db.prepare('SELECT id, name FROM users').all() as { id: number; name: string }[]).map(x => [x.id, x.name]));
  const quality = accountQualityMap(db, scope);
  const items = accounts.filter(a => !seg || a.segment === seg).filter(a => {
    if (!q) return true;
    return normalizeName(a.name).includes(q) || aliases.some(al => al.account_id === a.id && normalizeName(al.alias).includes(q));
  }).map(a => ({ id: a.id, name: a.name, segment: a.segment, owner: owners.get(a.owner_user_id), revenue12: rev.get(a.id) ?? 0, score: risk.get(a.id)?.score ?? 0, grade: risk.get(a.id)?.grade ?? '저', quality: quality.get(a.id) ?? 1,
    aliases: aliases.filter(al => al.account_id === a.id).map(al => al.alias) }))
    .sort((a, b) => b.revenue12 - a.revenue12);
  return ok({ items });
});

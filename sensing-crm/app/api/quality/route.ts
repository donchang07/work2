import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { qualityFor, scopedAccounts, scopeFor } from '@/lib/repo';
export const dynamic = 'force-dynamic';
export const GET = handle(async (req: Request) => {
  const u = await requireApiUser();
  const db = getDb();
  const scope = scopeFor(u);
  const sp = new URL(req.url).searchParams;
  const accountParam = Number(sp.get('account')) || undefined;
  const type = sp.get('type') || '';
  const accounts = scopedAccounts(db, scope);
  const ids = new Set(accounts.map(a => a.id));
  const accountId = accountParam && ids.has(accountParam) ? accountParam : undefined;
  const metrics = qualityFor(db, scope, accountId);
  const key = accountId ? `account:${accountId}` : scope.userId === null ? 'all' : `user:${scope.userId}`;
  const trend = (db.prepare('SELECT overall, completeness, accuracy, timeliness, consistency, uniqueness, computed_at FROM dq_snapshots WHERE scope=? ORDER BY computed_at DESC, id DESC LIMIT 8').all(key) as Record<string, unknown>[]).reverse();
  const names = new Map(accounts.map(a => [a.id, a.name]));
  const all = (db.prepare("SELECT * FROM dq_issues WHERE status='open' ORDER BY id").all() as { id: number; issue_type: string; entity: string; entity_id: number; account_id: number | null; description: string; raw_name: string | null; candidate_account_id: number | null; similarity: number | null }[])
    .filter(i => (i.account_id !== null && ids.has(i.account_id)) || (i.candidate_account_id !== null && ids.has(i.candidate_account_id)) || (scope.userId === null && i.account_id === null))
    .filter(i => !accountId || i.account_id === accountId || i.candidate_account_id === accountId);
  const allNames = new Map((db.prepare('SELECT id, name FROM accounts').all() as { id: number; name: string }[]).map(a => [a.id, a.name]));
  const issues = all.filter(i => !type || i.issue_type === type).map(i => ({ ...i, account_name: i.account_id ? allNames.get(i.account_id) ?? null : null }));
  const seen = new Set<string>();
  const queue = all.filter(i => ['unresolved_name', 'duplicate_account'].includes(i.issue_type) && i.candidate_account_id)
    .filter(i => { const k = `${i.issue_type}:${i.raw_name}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => (a.issue_type === b.issue_type ? a.id - b.id : a.issue_type === 'unresolved_name' ? -1 : 1))
    .map(i => ({ id: i.id, issue_type: i.issue_type, raw_name: i.raw_name, candidate_account_id: i.candidate_account_id, candidate_name: allNames.get(i.candidate_account_id!) ?? names.get(i.candidate_account_id!), similarity: i.similarity }));
  return ok({ metrics, trend, issues: issues.slice(0, 200), issueTotal: issues.length, queue, canMerge: u.role === 'admin', accountName: accountId ? names.get(accountId) : null });
});

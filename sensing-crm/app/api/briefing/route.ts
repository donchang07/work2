import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { scopedAccounts, scopeFor, today } from '@/lib/repo';
import { koreanDate } from '@/lib/time';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req: Request) => {
  const u = await requireApiUser();
  const db = getDb();
  const scope = scopeFor(u);
  const accounts = scopedAccounts(db, scope);
  const ids = new Set(accounts.map(a => a.id));
  const filter = Number(new URL(req.url).searchParams.get('account')) || null;
  const t = today();
  const rows = db.prepare(`SELECT s.*, a.name AS account_name FROM signals s LEFT JOIN accounts a ON a.id = s.account_id
    WHERE s.source_type IN ('disclosure','news') ORDER BY s.published_at DESC, s.id DESC`).all() as (Record<string, unknown> & { account_id: number | null; collected_at: string })[];
  const seoul = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date(iso));
  const todays = rows.filter(r => seoul(r.collected_at) === t && (r.account_id === null ? scope.userId === null : ids.has(r.account_id)));
  const recAccounts = new Set((db.prepare("SELECT DISTINCT account_id FROM recommendations WHERE status='new'").all() as { account_id: number }[]).map(r => r.account_id));
  const cards = todays.filter(r => !filter || r.account_id === filter).map(r => ({ ...r, hasRecs: r.account_id !== null && recAccounts.has(r.account_id) }));
  const highRisk = (db.prepare(`SELECT count(*) n FROM risk_scores r JOIN accounts a ON a.id=r.account_id WHERE r.grade='고' AND a.status='active' AND (? IS NULL OR a.owner_user_id=?)`).get(scope.userId, scope.userId) as { n: number }).n;
  const pendingLeads = (db.prepare("SELECT count(*) n FROM leads WHERE status='pending' AND (? IS NULL OR assignee_user_id=?)").get(scope.userId, scope.userId) as { n: number }).n;
  return ok({ dateLabel: koreanDate(t), tiles: { signals: todays.length, highRisk, pendingLeads }, accounts: accounts.map(a => ({ id: a.id, name: a.name })), cards });
});

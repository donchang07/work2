import { requireApiUser } from '@/lib/auth';
import { getDb, json } from '@/lib/db';
import { fail, handle, ok } from '@/lib/api';
import { canAccessAccount, qualityFor, rowToActivity, scopeFor, today } from '@/lib/repo';
import { daysBetween, monthOf } from '@/lib/time';
import type { RiskFactor } from '@/lib/domain/risk';
export const dynamic = 'force-dynamic';
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  const db = getDb();
  const acc = db.prepare('SELECT a.*, u.name AS owner FROM accounts a JOIN users u ON u.id=a.owner_user_id WHERE a.id=?').get(id) as { id: number; name: string; segment: string; owner: string; status: string } | undefined;
  if (!acc) return fail(404, 'not_found', '고객을 찾을 수 없습니다');
  if (!canAccessAccount(db, u, id)) return fail(403, 'forbidden');
  const t = today();
  const aliases = (db.prepare('SELECT alias FROM account_aliases WHERE account_id=? ORDER BY id').all(id) as { alias: string }[]).map(a => a.alias);
  const orders = db.prepare('SELECT order_month, sum(amount_krw) s FROM orders WHERE account_id=? GROUP BY order_month').all(id) as { order_month: string; s: number }[];
  const byMonth = new Map(orders.map(o => [o.order_month, o.s]));
  const monthly = Array.from({ length: 12 }, (_, k) => { const m = monthOf(t, 11 - k); return { month: m, amount: byMonth.get(m) ?? 0 }; });
  const sum = (bs: number[]) => bs.reduce((s, b) => s + (byMonth.get(monthOf(t, b)) ?? 0), 0);
  const recent3 = sum([0, 1, 2]), prior3 = sum([3, 4, 5]);
  const acts = (db.prepare('SELECT * FROM activities WHERE account_id=? ORDER BY meeting_date DESC').all(id) as Record<string, unknown>[]).map(rowToActivity);
  const lastConfirmed = acts.find(a => a.status === 'confirmed');
  const risk = db.prepare('SELECT * FROM risk_scores WHERE account_id=?').get(id) as { score: number; grade: string; reasons: string } | undefined;
  const factors = json<RiskFactor[]>(risk?.reasons, []);
  const signals = db.prepare('SELECT id, signal_type, title, published_at FROM signals WHERE account_id=? ORDER BY published_at DESC').all(id) as { id: number; signal_type: string; title: string; published_at: string }[];
  const timeline = [
    ...signals.map(s => ({ key: `s${s.id}`, date: s.published_at.slice(0, 10), kind: 'signal', type: s.signal_type, text: s.title })),
    ...acts.map(a => ({ key: `a${a.id}`, date: a.meeting_date, kind: 'activity', type: a.status === 'confirmed' ? '미팅(확정)' : '미팅(초안)', text: a.needs ?? a.ai_needs ?? a.raw_note.slice(0, 60) })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  const rec = db.prepare("SELECT * FROM recommendations WHERE account_id=? AND status='new' ORDER BY priority, due_date LIMIT 1").get(id) ?? null;
  const recCount = (db.prepare("SELECT count(*) n FROM recommendations WHERE account_id=? AND status='new'").get(id) as { n: number }).n;
  const scope = scopeFor(u);
  const quality = qualityFor(db, scope.userId === null ? { userId: null } : scope, id);
  const openIssues = (db.prepare("SELECT count(*) n FROM dq_issues WHERE status='open' AND (account_id=? OR candidate_account_id=?)").get(id, id) as { n: number }).n;
  return ok({
    account: { ...acc, aliases },
    tiles: { recent3, prior3, changePct: prior3 > 0 ? Math.round(((recent3 - prior3) / prior3) * 1000) / 10 : null, lastContactDays: lastConfirmed ? daysBetween(lastConfirmed.meeting_date, t) : null, score: risk?.score ?? 0, grade: risk?.grade ?? '저' },
    monthly, hasOrders: orders.length > 0, timeline, reasons: factors.filter(f => f.contribution > 0).sort((a, b) => b.contribution - a.contribution).slice(0, 3),
    rec, recCount, quality: quality.overall, openIssues,
  });
});

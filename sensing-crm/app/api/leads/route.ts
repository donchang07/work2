import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { rowToLead } from '@/lib/repo';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req: Request) => {
  const u = await requireApiUser();
  const db = getDb();
  const status = new URL(req.url).searchParams.get('status') || 'pending';
  const scopeId = u.role === 'admin' ? null : u.id;
  const counts = Object.fromEntries((db.prepare('SELECT status, count(*) n FROM leads WHERE (? IS NULL OR assignee_user_id=?) GROUP BY status').all(scopeId, scopeId) as { status: string; n: number }[]).map(r => [r.status, r.n]));
  const names = new Map((db.prepare('SELECT id, name FROM accounts').all() as { id: number; name: string }[]).map(a => [a.id, a.name]));
  const rows = (db.prepare(`SELECT l.*, s.source_type, u.name AS assignee_name FROM leads l JOIN signals s ON s.id=l.signal_id JOIN users u ON u.id=l.assignee_user_id
    WHERE l.status=? AND (? IS NULL OR l.assignee_user_id=?) ORDER BY l.created_at DESC, l.id DESC`).all(status, scopeId, scopeId) as Record<string, unknown>[]);
  const leads = rows.map(r => { const l = rowToLead(r); return { ...l, source_type: r.source_type, assignee_name: r.assignee_name, matched_account_name: l.matched_account_id ? names.get(l.matched_account_id) : null, candidates: l.candidate_ids.map(id => ({ id, name: names.get(id) })) }; });
  const kams = u.role === 'admin' ? db.prepare("SELECT id, name, role FROM users ORDER BY id").all() : [];
  return ok({ counts: { pending: counts.pending ?? 0, accepted: counts.accepted ?? 0, rejected: counts.rejected ?? 0 }, leads, kams });
});

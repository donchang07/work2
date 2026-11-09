import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { rowToActivity, scopedAccounts, scopeFor, today } from '@/lib/repo';
export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  const u = await requireApiUser();
  const db = getDb();
  const accounts = scopedAccounts(db, scopeFor(u)).map(a => ({ id: a.id, name: a.name }));
  const recent = (db.prepare('SELECT a.*, c.name AS account_name FROM activities a JOIN accounts c ON c.id=a.account_id WHERE a.author_user_id=? ORDER BY a.recorded_at DESC, a.id DESC LIMIT 10').all(u.id) as Record<string, unknown>[])
    .map(r => ({ ...rowToActivity(r), account_name: r.account_name }));
  return ok({ accounts, recent, today: today(), now: new Date().toISOString() });
});

import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  const u = await requireApiUser();
  const n = getDb().prepare("SELECT count(*) n FROM leads WHERE status='pending' AND (? = 'admin' OR assignee_user_id = ?)").get(u.role, u.id) as { n: number };
  return ok({ user: u, pendingLeads: n.n });
});

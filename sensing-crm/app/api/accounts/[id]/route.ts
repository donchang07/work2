import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { canAccessAccount } from '@/lib/repo';
import { fail, handle, ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  const db = getDb();
  if (!db.prepare('SELECT 1 FROM accounts WHERE id=?').get(id)) return fail(404, 'not_found');
  if (!canAccessAccount(db, u, id)) return fail(403, 'forbidden');
  return ok({ id });
});

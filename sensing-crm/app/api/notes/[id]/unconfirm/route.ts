import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { fail, handle, ok } from '@/lib/api';
import { refreshDerived } from '@/lib/repo';
import { now } from '@/lib/time';
export const POST = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  const db = getDb();
  const a = db.prepare('SELECT author_user_id, status, confirmed_at FROM activities WHERE id=?').get(id) as { author_user_id: number; status: string; confirmed_at: string | null } | undefined;
  if (!a) return fail(404, 'not_found');
  if (a.author_user_id !== u.id) return fail(403, 'forbidden');
  if (a.status !== 'confirmed' || !a.confirmed_at || now().getTime() - Date.parse(a.confirmed_at) > 24 * 3600 * 1000) return fail(409, 'expired', '확정 후 24시간이 지나 취소할 수 없습니다');
  db.prepare("UPDATE activities SET status='draft', verified=0, confirmed_at=NULL WHERE id=?").run(id);
  await refreshDerived(db);
  return ok({ ok: true });
});

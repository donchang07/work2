import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
export const POST = handle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  getDb().prepare("DELETE FROM activities WHERE id=? AND author_user_id=? AND status='draft' AND confirmed_at IS NULL AND ai_method IS NOT NULL").run(id, u.id);
  return ok({ ok: true });
});

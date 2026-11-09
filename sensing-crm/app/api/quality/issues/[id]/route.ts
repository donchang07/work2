import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { body, fail, handle, ok } from '@/lib/api';
import { resolveIssue } from '@/lib/repo';
export const POST = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser({ admin: true });
  const { action } = await body<{ action?: 'merge' | 'dismiss' }>(req);
  if (action !== 'merge' && action !== 'dismiss') return fail(400, 'bad_action');
  const r = await resolveIssue(getDb(), Number((await ctx.params).id), action, u.id);
  return r.ok ? ok({ ok: true }) : fail(r.code === 'not_found' ? 404 : 400, r.code);
});

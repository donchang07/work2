import { requireApiUser } from '@/lib/auth';
import { fail, handle, ok } from '@/lib/api';
import { collectSignals, JobBusy } from '@/lib/jobs';
export const POST = handle(async () => {
  const u = await requireApiUser({ admin: true });
  try { return ok(await collectSignals(u.id)); } catch (e) { if (e instanceof JobBusy) return fail(409, 'busy', '다른 작업이 실행 중입니다.'); throw e; }
});

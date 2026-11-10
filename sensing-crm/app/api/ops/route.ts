import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { aiStatusLabel } from '@/lib/ai';
import { convertibleCount, pendingFeedCount } from '@/lib/jobs';
export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  await requireApiUser({ admin: true });
  const logs = getDb().prepare('SELECT j.*, u.name AS run_by_name FROM job_runs j JOIN users u ON u.id=j.run_by ORDER BY j.id DESC LIMIT 30').all();
  return ok({ pendingFeed: pendingFeedCount(), convertible: convertibleCount(), aiStatus: aiStatusLabel(), logs });
});

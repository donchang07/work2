import { requireApiUser } from '@/lib/auth';
import { getDb, json } from '@/lib/db';
import { handle, ok } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  await requireApiUser({ admin: true });
  const runs = (getDb().prepare('SELECT l.*, u.name AS run_by_name FROM lab_runs l JOIN users u ON u.id=l.run_by ORDER BY l.id DESC LIMIT 10').all() as (Record<string, unknown> & { results: string | null })[])
    .map(r => ({ ...r, status: r.status as string, results: json<unknown>(r.results, null) }));
  return ok({ runs, latest: runs.find(r => r.status === 'done') ?? null });
});

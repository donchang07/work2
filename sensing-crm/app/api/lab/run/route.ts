import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { buildTruth } from '@/lib/seed';
import { runLab } from '@/lib/domain/lab';
import { nowIso, today } from '@/lib/repo';
export const POST = handle(async () => {
  const u = await requireApiUser({ admin: true });
  const db = getDb();
  const id = Number(db.prepare("INSERT INTO lab_runs(run_at, run_by, seed, status) VALUES (?,?,42,'running')").run(nowIso(), u.id).lastInsertRowid);
  try {
    const t = today();
    const results = runLab(buildTruth(t).truth, t, 42);
    db.prepare("UPDATE lab_runs SET status='done', results=? WHERE id=?").run(JSON.stringify(results), id);
    return ok({ id, results });
  } catch (e) {
    db.prepare("UPDATE lab_runs SET status='failed', error=? WHERE id=?").run((e as Error).message, id);
    throw e;
  }
});

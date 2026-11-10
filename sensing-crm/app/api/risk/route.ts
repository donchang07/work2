import { requireApiUser } from '@/lib/auth';
import { getDb, json } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { accountQualityMap, scopeFor } from '@/lib/repo';
import type { RiskFactor } from '@/lib/domain/risk';
export const dynamic = 'force-dynamic';
export const GET = handle(async (req: Request) => {
  const u = await requireApiUser();
  const db = getDb();
  const scope = scopeFor(u);
  const grade = new URL(req.url).searchParams.get('grade') || '';
  const rows = db.prepare(`SELECT r.*, a.name FROM risk_scores r JOIN accounts a ON a.id=r.account_id WHERE a.status='active' AND (? IS NULL OR a.owner_user_id=?) ORDER BY r.score DESC, a.name`).all(scope.userId, scope.userId) as { account_id: number; name: string; score: number; grade: string; reasons: string; computed_at: string }[];
  const q = accountQualityMap(db, scope);
  const counts = { 고: 0, 중: 0, 저: 0 } as Record<string, number>;
  for (const r of rows) counts[r.grade]++;
  const items = rows.filter(r => !grade || r.grade === grade).map(r => {
    const factors = json<RiskFactor[]>(r.reasons, []);
    return { account_id: r.account_id, name: r.name, score: r.score, grade: r.grade, computed_at: r.computed_at, factors, top: factors.filter(f => f.contribution > 0).sort((a, b) => b.contribution - a.contribution).slice(0, 3), quality: q.get(r.account_id) ?? 1 };
  });
  return ok({ items, counts });
});

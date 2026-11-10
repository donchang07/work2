import { degrade } from './generate';
import { computeQuality, type QualityMetrics } from './quality';
import { computeRisk } from './risk';
import { recommend } from './nba';
import type { Dataset } from './types';

export const RATIOS = [0, 0.25, 0.5, 0.75, 1];
export interface LabPoint extends QualityMetrics { ratio: number; quality: number; recall: number; precision: number; nba_hit: number; highCount: number; tp: number; churners: number }

/** 정답 세계에서 자동화 비율만 바꿔 품질·P-2·O-2 성과를 평가 (11.9) */
export function evaluate(truth: Dataset, ratio: number, today: string, seed = 42): LabPoint {
  const ds = degrade(truth, ratio, seed);
  const primaryOf = new Map(ds.accounts.map(a => [a.id, a.primary_id ?? a.id]));
  const churn = new Set(truth.accounts.filter(a => a.truth_churn).map(a => a.id));
  const dupCount = ds.accounts.filter(a => (a.primary_id ?? a.id) !== a.id).length;
  const q = computeQuality({ activities: ds.activities, signals: ds.signals, accountCount: ds.accounts.length, duplicateAccountCount: dupCount });
  const grades = new Map<number, '고' | '중' | '저'>();
  for (const a of ds.accounts) {
    const r = computeRisk({ orders: ds.orders.filter(o => o.account_id === a.id), activities: ds.activities.filter(x => x.account_id === a.id), signals: ds.signals.filter(s => s.account_id === a.id), today });
    grades.set(a.id, r.grade);
  }
  const high = ds.accounts.filter(a => grades.get(a.id) === '고');
  const tp = truth.accounts.filter(a => churn.has(a.id) && grades.get(a.id) === '고').length;
  const highTrue = high.filter(a => churn.has(primaryOf.get(a.id)!)).length;
  let hits = 0, judged = 0;
  for (const a of truth.accounts) {
    if (!a.truth_next_action) continue;
    judged++;
    const recs = recommend({ grade: grades.get(a.id) ?? '저', orders: ds.orders.filter(o => o.account_id === a.id), activities: ds.activities.filter(x => x.account_id === a.id), signals: ds.signals.filter(s => s.account_id === a.id), leads: ds.leads.filter(l => l.matched_account_id === a.id), today });
    if (recs.some(r => r.action_type === a.truth_next_action)) hits++;
  }
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  return { ratio, ...q, quality: q.overall, recall: r3(tp / Math.max(churn.size, 1)), precision: r3(high.length ? highTrue / high.length : 0), nba_hit: r3(judged ? hits / judged : 0), highCount: high.length, tp, churners: churn.size };
}
export function runLab(truth: Dataset, today: string, seed = 42): LabPoint[] { return RATIOS.map(r => evaluate(truth, r, today, seed)); }

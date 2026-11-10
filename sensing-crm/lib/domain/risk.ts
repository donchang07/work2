import type { Activity, Order, Signal } from './types';
import { addDays, daysBetween, monthOf } from '../time';

export interface RiskInput { orders: Order[]; activities: Activity[]; signals: Signal[]; today: string }
export interface RiskFactor { key: string; label: string; raw: number; rawText: string; normalized: number; weight: number; contribution: number }
export interface RiskResult { score: number; grade: '고' | '중' | '저'; factors: RiskFactor[]; reasons: RiskFactor[] }

export const RISK_WEIGHTS = { order: 35, gap: 20, competitor: 20, complaint: 15, threat: 10 };
export const THREAT_TYPES = ['경쟁사평가', '국산화'];

/** 원값 → 점수 (11.6). 테스트용으로 원값만 받아 계산하는 함수 */
export function scoreFromRaw(raw: { orderDecline: number; gapDays: number; competitorCount: number; complaintCount: number; threatCount: number }): RiskResult {
  const f = (key: string, label: string, rawV: number, rawText: string, norm: number, w: number): RiskFactor => ({ key, label, raw: rawV, rawText, normalized: round3(norm), weight: w, contribution: Math.round(norm * w * 10) / 10 });
  const factors = [
    f('order', '주문 감소', raw.orderDecline, `${Math.round(raw.orderDecline * 100)}% 감소`, Math.min(Math.max(raw.orderDecline, 0) / 0.5, 1), RISK_WEIGHTS.order),
    f('gap', '접촉 공백', raw.gapDays, `${raw.gapDays}일`, Math.min(raw.gapDays / 90, 1), RISK_WEIGHTS.gap),
    f('competitor', '경쟁사 언급', raw.competitorCount, `${raw.competitorCount}회`, Math.min(raw.competitorCount / 3, 1), RISK_WEIGHTS.competitor),
    f('complaint', '불만·부정 반응', raw.complaintCount, `${raw.complaintCount}건`, Math.min(raw.complaintCount / 2, 1), RISK_WEIGHTS.complaint),
    f('threat', '위협 신호', raw.threatCount, `${raw.threatCount}건`, Math.min(raw.threatCount / 2, 1), RISK_WEIGHTS.threat),
  ];
  const score = Math.round(factors.reduce((s, x) => s + x.normalized * x.weight, 0));
  const grade = score >= 60 ? '고' : score >= 35 ? '중' : '저';
  const reasons = factors.filter(x => x.contribution > 0).sort((a, b) => b.contribution - a.contribution).slice(0, 3);
  return { score, grade, factors, reasons };
}
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function riskRaw({ orders, activities, signals, today }: RiskInput) {
  const recent = [0, 1, 2].map(b => monthOf(today, b));
  const prior = [3, 4, 5].map(b => monthOf(today, b));
  const sum = (ms: string[]) => orders.filter(o => ms.includes(o.order_month)).reduce((s, o) => s + o.amount_krw, 0);
  const r = sum(recent), p = sum(prior);
  const orderDecline = p > 0 ? Math.max(0, (p - r) / p) : 0;
  const confirmed = activities.filter(a => a.status === 'confirmed');
  const last = confirmed.map(a => a.meeting_date).sort().at(-1);
  const gapDays = last ? Math.max(0, daysBetween(last, today)) : 90;
  const since = addDays(today, -90);
  const win = confirmed.filter(a => a.meeting_date >= since);
  const competitorCount = win.reduce((s, a) => s + (a.competitors?.length ?? 0), 0);
  const complaintCount = win.filter(a => (a.complaints && a.complaints.trim()) || a.sentiment === '부정').length;
  const threatCount = signals.filter(s => THREAT_TYPES.includes(s.signal_type) && s.published_at.slice(0, 10) >= since).length;
  return { orderDecline: round3(orderDecline), gapDays, competitorCount, complaintCount, threatCount };
}
export function computeRisk(input: RiskInput): RiskResult { return scoreFromRaw(riskRaw(input)); }

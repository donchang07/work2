import { describe, it, expect } from 'vitest';
import { scoreFromRaw, computeRisk } from '../../lib/domain/risk';

describe('SC-028 이탈위험 점수 규칙(11.6)', () => {
  it('모든 요인 최대 입력 → 100, 고등급', () => {
    const r = scoreFromRaw({ orderDecline: 0.5, gapDays: 90, competitorCount: 3, complaintCount: 2, threatCount: 2 });
    expect(r.score).toBe(100); expect(r.grade).toBe('고');
  });
  it('모두 0 → 0, 저등급, 근거 없음', () => {
    const r = scoreFromRaw({ orderDecline: 0, gapDays: 0, competitorCount: 0, complaintCount: 0, threatCount: 0 });
    expect(r.score).toBe(0); expect(r.grade).toBe('저'); expect(r.reasons).toEqual([]);
  });
  it('근거는 기여 점수 내림차순 상위 3개', () => {
    const r = scoreFromRaw({ orderDecline: 0.3, gapDays: 45, competitorCount: 1, complaintCount: 2, threatCount: 0 });
    expect(r.reasons.map(x => x.key)).toEqual(['order', 'complaint', 'gap']);
    expect(r.score).toBe(Math.round(0.6 * 35 + 0.5 * 20 + (1 / 3) * 20 + 15));
    const c = r.reasons.map(x => x.contribution); expect([...c].sort((a, b) => b - a)).toEqual(c);
  });
  it('등급 경계: 60 고, 35 중', () => {
    expect(scoreFromRaw({ orderDecline: 0.5, gapDays: 0, competitorCount: 0, complaintCount: 2, threatCount: 2 }).score).toBe(60);
    expect(scoreFromRaw({ orderDecline: 0.5, gapDays: 0, competitorCount: 0, complaintCount: 2, threatCount: 2 }).grade).toBe('고');
    expect(scoreFromRaw({ orderDecline: 0.5, gapDays: 0, competitorCount: 0, complaintCount: 0, threatCount: 0 }).grade).toBe('중');
  });
  it('확정 활동만 반영하고 접촉 기록이 없으면 공백 90일', () => {
    const r = computeRisk({ orders: [], activities: [], signals: [], today: '2026-11-09' });
    expect(r.factors.find(f => f.key === 'gap')!.raw).toBe(90);
  });
});

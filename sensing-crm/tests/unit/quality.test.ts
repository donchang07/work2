import { describe, it, expect } from 'vitest';
import { computeQuality } from '../../lib/domain/quality';
import type { Activity, Signal } from '../../lib/domain/types';

const act = (i: number, o: Partial<Activity> = {}): Activity => ({
  id: i, account_id: 1, author_user_id: 1, meeting_date: '2026-11-01', raw_note: 'x',
  needs: 'n', products: ['p'], competitors: [], complaints: null, next_step: 's', next_contact_date: '2026-11-20', sentiment: '중립',
  status: 'confirmed', corrected_field_count: 0, verified: 1, recorded_at: '2026-11-01T09:00:00.000Z', confirmed_at: '2026-11-01T09:00:00.000Z', ...o,
});
const sig = (i: number, account_id: number | null): Signal => ({ id: i, source_type: 'news', source_id: `s${i}`, raw_org_name: 'x', account_id, signal_type: '인사', title: 't', body: 'b', url: null, modality: null, stage: null, budget_krw: null, published_at: '', collected_at: '', summary: '', summary_method: 'rule' });

describe('SC-025 품질 지표 계산(11.5)', () => {
  it('고정 픽스처: 누락 2·지연 3·미검증 2·미해소 1·중복 1', () => {
    const activities = [
      act(1, { needs: null }), act(2, { next_contact_date: null }),
      act(3, { recorded_at: '2026-11-05T09:00:00.000Z' }), act(4, { recorded_at: '2026-11-06T09:00:00.000Z' }), act(5, { recorded_at: '2026-11-09T09:00:00.000Z' }),
      act(6, { verified: 0, status: 'draft' }), act(7, { verified: 0, status: 'draft' }), act(8), act(9), act(10),
    ];
    const signals = [sig(1, 1), sig(2, 2), sig(3, 3), sig(4, 4), sig(5, null)];
    const m = computeQuality({ activities, signals, accountCount: 10, duplicateAccountCount: 1 });
    expect(m.completeness).toBeCloseTo(0.96, 3);
    expect(m.accuracy).toBeCloseTo(0.8, 3);
    expect(m.timeliness).toBeCloseTo(0.7, 3);
    expect(m.consistency).toBeCloseTo(0.8, 3);
    expect(m.uniqueness).toBeCloseTo(0.9, 3);
    expect(m.overall).toBeCloseTo((0.96 + 0.8 + 0.7 + 0.8 + 0.9) / 5, 3);
  });
  it('빈 입력은 1(결측 없음)로 계산', () => {
    expect(computeQuality({ activities: [], signals: [], accountCount: 0, duplicateAccountCount: 0 }).overall).toBe(1);
  });
});

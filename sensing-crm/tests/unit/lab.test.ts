import { describe, it, expect } from 'vitest';
import { buildTruth } from '../../lib/seed';
import { runLab, RATIOS } from '../../lib/domain/lab';
import { degrade } from '../../lib/domain/generate';

describe('SC-034 품질-성과 실험(시드 42)', () => {
  for (const today of ['2026-11-09', '2027-03-01']) {
    it(`기준일 ${today}: 품질 단조 비감소, 재현율 격차 ≥ 0.30, 100% 재현율 ≥ 0.80`, () => {
      const { truth } = buildTruth(today);
      const r = runLab(truth, today, 42);
      expect(r.map(p => p.ratio)).toEqual(RATIOS);
      for (let i = 1; i < r.length; i++) expect(r[i].quality).toBeGreaterThanOrEqual(r[i - 1].quality);
      expect(r[4].recall - r[0].recall).toBeGreaterThanOrEqual(0.3);
      expect(r[4].recall).toBeGreaterThanOrEqual(0.8);
      expect(r[0].churners).toBe(6);
    });
  }
  it('공통 난수: 자동화 비율이 높을수록 결측 필드 수가 늘지 않음', () => {
    const { truth } = buildTruth('2026-11-09');
    const nulls = RATIOS.map(x => degrade(truth, x).activities.reduce((s, a) => s + [a.needs, a.next_step, a.sentiment].filter(v => v === null).length, 0));
    for (let i = 1; i < nulls.length; i++) expect(nulls[i]).toBeLessThanOrEqual(nulls[i - 1]);
  });
  it('실험은 결정적이다', () => {
    const { truth } = buildTruth('2026-11-09');
    expect(runLab(truth, '2026-11-09')).toEqual(runLab(buildTruth('2026-11-09').truth, '2026-11-09'));
  });
});

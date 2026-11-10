import { describe, it, expect } from 'vitest';
import { classify, matchOrg, normalizeName, jaroWinkler } from '../../lib/domain/names';

const accounts = [{ id: 1, name: '다온항체연구소', status: 'active' as const }, { id: 2, name: '송도바이오로직스', status: 'active' as const }];
const aliases = [{ account_id: 2, alias: 'SDBL' }, { account_id: 2, alias: 'Songdo Biologics' }];

describe('SC-016 기관명 매칭 경계값', () => {
  it('유사도 0.85 이상 auto, 0.60 이상 0.85 미만 candidate, 0.60 미만 new', () => {
    expect(classify(0.85)).toBe('auto');
    expect(classify(0.849)).toBe('candidate');
    expect(classify(0.6)).toBe('candidate');
    expect(classify(0.599)).toBe('new');
  });
  it('승인 별칭·고객명 정확 일치는 1.0 auto', () => {
    expect(matchOrg('SDBL', accounts, aliases)).toMatchObject({ account_id: 2, score: 1, status: 'auto', exact: true });
    expect(matchOrg('Songdo Biologics Co., Ltd.', accounts, aliases)).toMatchObject({ account_id: 2, score: 1, status: 'auto' });
    expect(matchOrg('(주)다온항체연구소', accounts, aliases)).toMatchObject({ account_id: 1, score: 1 });
  });
  it('실제 분기: 유사 이름은 auto/candidate, 무관한 이름은 new', () => {
    const near = matchOrg('다온항체연구센터', accounts, aliases);
    expect(near.score).toBeGreaterThanOrEqual(0.85); expect(near.status).toBe('auto');
    const mid = matchOrg('다온바이오', accounts, aliases);
    expect(mid.score).toBeGreaterThanOrEqual(0.6); expect(mid.score).toBeLessThan(0.85); expect(mid.status).toBe('candidate');
    const far = matchOrg('미래소재연구원', accounts, aliases);
    expect(far.status).toBe('new');
  });
  it('정규화와 Jaro-Winkler 기본 성질', () => {
    expect(normalizeName('  ㈜ 송도 바이오-로직스 ')).toBe('송도바이오로직스');
    expect(jaroWinkler('abc', 'abc')).toBe(1);
    expect(jaroWinkler('abc', 'xyz')).toBe(0);
  });
});

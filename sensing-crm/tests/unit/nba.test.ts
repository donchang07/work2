import { describe, it, expect } from 'vitest';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { recommend } from '../../lib/domain/nba';
import type { Activity, Lead, Signal } from '../../lib/domain/types';
import { openDb } from '../../lib/db';
import { seedDatabase } from '../../lib/seed';
import { recomputeRecs } from '../../lib/repo';

const T = '2026-11-09';
const act = (o: Partial<Activity>): Activity => ({ id: 1, account_id: 1, author_user_id: 1, meeting_date: '2026-11-01', raw_note: '', needs: 'n', products: ['질량분석기'], competitors: [], complaints: null, next_step: 's', next_contact_date: null, sentiment: '중립', status: 'confirmed', corrected_field_count: 0, verified: 1, recorded_at: '', confirmed_at: '', ...o });
const sig = (id: number, type: string, st: Signal['source_type'] = 'news', date = '2026-11-01'): Signal => ({ id, source_type: st, source_id: `${id}`, raw_org_name: 'x', account_id: 1, signal_type: type, title: `${type} 신호`, body: '', url: null, modality: '항체', stage: '1상', budget_krw: null, published_at: `${date}T00:00:00Z`, collected_at: '', summary: '', summary_method: 'rule' });
const lead = (id: number, signal_id: number): Lead => ({ id, signal_id, org_name: 'x', matched_account_id: 1, match_score: 1, match_status: 'auto', candidate_ids: [], modality: '항체', stage: '1상', budget_krw: null, recommended_products: [], confidence: 1, status: 'accepted', reject_reason: null, assignee_user_id: 1, decided_by: 1, decided_at: '2026-11-01T00:00:00Z', created_at: '2026-10-30T00:00:00Z' });
const base = { orders: [], activities: [] as Activity[], signals: [] as Signal[], leads: [] as Lead[], today: T, grade: '저' as const };

describe('SC-030 추천 규칙(11.7)', () => {
  it('조건별 기대 행동', () => {
    expect(recommend({ ...base, grade: '고' })[0].action_type).toBe('exec_review');
    expect(recommend({ ...base, activities: [act({ competitors: ['알파사이언스'] })] })[0]).toMatchObject({ action_type: 'tech_comparison', channel: '이메일', due_date: '2026-11-16' });
    expect(recommend({ ...base, signals: [sig(1, '증설')] })[0]).toMatchObject({ action_type: 'supply_proposal', basis_signal_ids: [1] });
    expect(recommend({ ...base, activities: [act({ next_contact_date: '2026-11-12' })] })[0]).toMatchObject({ action_type: 'follow_up', channel: '전화', due_date: '2026-11-12' });
    expect(recommend({ ...base, signals: [sig(2, '임상', 'clinical')], leads: [lead(1, 2)] })[0]).toMatchObject({ action_type: 'process_dev', product_family: '세포배양 배지·크로마토그래피 레진' });
    expect(recommend({ ...base, signals: [sig(3, '과제', 'ntis')], leads: [lead(2, 3)] })[0]).toMatchObject({ action_type: 'equipment_demo' });
    expect(recommend({ ...base, signals: [sig(4, '증설', 'news', '2026-09-01')] })).toEqual([]);
  });
  it('조건 6개가 겹쳐도 최대 3건, 우선순위순, 행동 유형 중복 없음', () => {
    const r = recommend({ ...base, grade: '고', activities: [act({ competitors: ['감마라이프'], next_contact_date: '2026-11-10' })], signals: [sig(1, '증설'), sig(2, '임상', 'clinical'), sig(3, '과제', 'ntis')], leads: [lead(1, 2), lead(2, 3)] });
    expect(r.map(x => x.action_type)).toEqual(['exec_review', 'tech_comparison', 'supply_proposal']);
    expect(new Set(r.map(x => x.action_type)).size).toBe(r.length);
  });
  it('재계산을 반복해도 고객·행동 유형별 미결 추천은 1건', async () => {
    process.env.AI_MODE = 'off';
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nba-')); process.env.DATA_DIR = path.join(dir, 'feeds');
    const db = openDb(path.join(dir, 'x.db'));
    await seedDatabase(db);
    db.prepare("UPDATE recommendations SET status='held' WHERE id = (SELECT min(id) FROM recommendations)").run();
    await recomputeRecs(db); await recomputeRecs(db);
    const dup = db.prepare("SELECT account_id, action_type, count(*) n FROM recommendations WHERE status IN ('new','held') GROUP BY 1,2 HAVING n > 1").all();
    expect(dup).toEqual([]);
    const perAccount = db.prepare("SELECT max(n) m FROM (SELECT count(*) n FROM recommendations WHERE status='new' GROUP BY account_id)").get() as { m: number };
    expect(perAccount.m).toBeLessThanOrEqual(3);
    db.close();
  });
});

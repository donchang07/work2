import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDb, TABLES } from '../../lib/db';
import { seedDatabase } from '../../lib/seed';

function hashDb(file: string) {
  const db = openDb(file);
  const h = crypto.createHash('sha256');
  for (const t of TABLES.filter(t => !['sessions', 'dq_snapshots', 'job_runs', 'lab_runs'].includes(t))) {
    const rows = db.prepare(`SELECT * FROM ${t} ORDER BY 1`).all() as Record<string, unknown>[];
    for (const r of rows) { delete r.computed_at; delete r.created_at; h.update(JSON.stringify(r)); }
  }
  const counts = {
    users: (db.prepare('SELECT count(*) n FROM users').get() as { n: number }).n,
    accounts: (db.prepare("SELECT count(*) n FROM accounts WHERE id < 1000").get() as { n: number }).n,
    churn: (db.prepare('SELECT count(*) n FROM accounts WHERE truth_churn=1 AND id < 1000').get() as { n: number }).n,
  };
  db.close();
  return { hash: h.digest('hex'), counts };
}

describe('SC-010 결정적 시드', () => {
  it('두 번 실행한 DB 해시가 같고 고객 30·정답 이탈 6·사용자 3', async () => {
    process.env.AI_MODE = 'mock';
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
    process.env.DATA_DIR = path.join(dir, 'feeds');
    const out = [];
    for (const f of ['a.db', 'b.db']) { const db = openDb(path.join(dir, f)); await seedDatabase(db); db.close(); out.push(hashDb(path.join(dir, f))); }
    expect(out[0].hash).toBe(out[1].hash);
    expect(out[0].counts).toEqual({ users: 3, accounts: 30, churn: 6 });
  });
});

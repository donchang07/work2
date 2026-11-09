import { getDb } from './db';
import { readFeeds, seedDatabase } from './seed';
import { feedToSignal, signalToLead } from './domain/generate';
import { summarize } from './ai';
import { loadAll, nowIso, refreshDerived } from './repo';
import type { Signal } from './domain/types';

export class JobBusy extends Error {}
function startJob(job: string, userId: number): number {
  const db = getDb();
  const running = db.prepare("SELECT 1 FROM job_runs WHERE status='running' AND started_at > ?").get(new Date(Date.now() - 120_000).toISOString());
  if (running) throw new JobBusy('busy');
  return Number(db.prepare("INSERT INTO job_runs(job, started_at, status, run_by) VALUES (?,?, 'running', ?)").run(job, nowIso(), userId).lastInsertRowid);
}
function endJob(id: number, status: 'done' | 'failed', count: number, skipped: number, message: string) {
  getDb().prepare('UPDATE job_runs SET finished_at=?, status=?, count=?, skipped=?, message=? WHERE id=?').run(nowIso(), status, count, skipped, message, id);
}

export function pendingFeedCount(): number {
  const db = getDb();
  const have = new Set((db.prepare('SELECT source_id FROM signals').all() as { source_id: string }[]).map(r => r.source_id));
  return readFeeds().filter(i => !have.has(i.source_id)).length;
}
export function convertibleCount(): number {
  return (getDb().prepare("SELECT count(*) n FROM signals s WHERE s.source_type IN ('clinical','ntis') AND NOT EXISTS (SELECT 1 FROM leads l WHERE l.signal_id = s.id)").get() as { n: number }).n;
}

/** FR-013 신호 수집 */
export async function collectSignals(userId: number) {
  const id = startJob('collect_signals', userId);
  try {
    const db = getDb();
    const { accounts, aliases } = loadAll(db);
    const have = new Set((db.prepare('SELECT source_id FROM signals').all() as { source_id: string }[]).map(r => r.source_id));
    const feed = readFeeds();
    const fresh = feed.filter(i => !have.has(i.source_id));
    const skipped = feed.length - fresh.length;
    const at = nowIso();
    const rows: Signal[] = [];
    for (const item of fresh) rows.push(feedToSignal(item, 0, { accounts, aliases }, at, await summarize(item.title, item.body)));
    const ins = db.prepare('INSERT INTO signals(source_type,source_id,raw_org_name,account_id,signal_type,title,body,url,modality,stage,budget_krw,published_at,collected_at,summary,summary_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    db.transaction(() => { for (const s of rows) ins.run(s.source_type, s.source_id, s.raw_org_name, s.account_id, s.signal_type, s.title, s.body, s.url, s.modality, s.stage, s.budget_krw, s.published_at, s.collected_at, s.summary, s.summary_method); })();
    await refreshDerived(db);
    endJob(id, 'done', rows.length, skipped, `신호 ${rows.length}건을 수집했습니다(중복 ${skipped}건 제외)`);
    return { count: rows.length, skipped };
  } catch (e) { endJob(id, 'failed', 0, 0, (e as Error).message); throw e; }
}

/** FR-016 리드 변환 */
export async function convertLeads(userId: number) {
  const id = startJob('convert_leads', userId);
  try {
    const db = getDb();
    const { accounts, aliases } = loadAll(db);
    const admin = (db.prepare("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1").get() as { id: number }).id;
    const sigs = db.prepare("SELECT * FROM signals s WHERE s.source_type IN ('clinical','ntis') AND NOT EXISTS (SELECT 1 FROM leads l WHERE l.signal_id = s.id)").all() as Signal[];
    const ins = db.prepare('INSERT INTO leads(signal_id,org_name,matched_account_id,match_score,match_status,candidate_ids,modality,stage,budget_krw,recommended_products,confidence,status,assignee_user_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const at = nowIso();
    db.transaction(() => {
      for (const s of sigs) {
        const l = signalToLead(s, 0, { accounts, aliases }, admin, at);
        ins.run(l.signal_id, l.org_name, l.matched_account_id, l.match_score, l.match_status, JSON.stringify(l.candidate_ids), l.modality, l.stage, l.budget_krw, JSON.stringify(l.recommended_products), l.confidence, 'pending', l.assignee_user_id, at);
      }
    })();
    endJob(id, 'done', sigs.length, 0, `리드 ${sigs.length}건을 만들었습니다`);
    return { count: sigs.length };
  } catch (e) { endJob(id, 'failed', 0, 0, (e as Error).message); throw e; }
}

/** FR-014 데모 초기화 */
export async function resetDemo(userId: number) {
  const sessions = getDb().prepare('SELECT * FROM sessions').all() as { token_hash: string; user_id: number; expires_at: string }[];
  await seedDatabase(getDb(), 'default');
  const ins = getDb().prepare('INSERT OR IGNORE INTO sessions(token_hash, user_id, expires_at) VALUES (?,?,?)');
  for (const s of sessions) ins.run(s.token_hash, s.user_id, s.expires_at); // 초기화한 관리자의 로그인 유지
  getDb().prepare("INSERT INTO job_runs(job, started_at, finished_at, status, count, skipped, message, run_by) VALUES ('reset', ?, ?, 'done', 0, 0, '초기화했습니다', ?)").run(nowIso(), nowIso(), userId);
  return { ok: true };
}

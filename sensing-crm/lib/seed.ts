import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { feedDir } from './db';
import { degrade, feedToSignal, generatePipeline, generateTruth, signalToLead } from './domain/generate';
import type { Dataset, FeedItem, Signal } from './domain/types';
import { computeRisk } from './domain/risk';
import { recommend } from './domain/nba';
import { hashPassword } from './auth-core';
import { summarize } from './ai';
import { addDays, isoAt, now, seoulDate } from './time';
import { refreshDerived, snapshot } from './repo';
import { normalizeName } from './domain/names';

export type SeedVariant = 'default' | 'empty-today';
const DELETE_ORDER = ['sessions', 'job_runs', 'lab_runs', 'dq_snapshots', 'dq_issues', 'recommendations', 'risk_scores', 'leads', 'activities', 'orders', 'signals', 'account_aliases', 'accounts', 'users'];

/** 정답 세계 + 리드 파이프라인 + 정답 다음 행동 */
export function buildTruth(today: string): { truth: Dataset; todayItems: FeedItem[] } {
  const truth = generateTruth(today);
  const { history, todayItems } = generatePipeline(truth, today);
  let sid = Math.max(...truth.signals.map(s => s.id)) + 1, lid = 1;
  for (const item of history) {
    const s = feedToSignal(item, sid++, truth, item.published_at, { text: '', method: 'rule' });
    truth.signals.push(s);
    const lead = signalToLead(s, lid++, truth, 3, item.published_at);
    if (['clin-h1', 'clin-h2', 'ntis-h1', 'ntis-h2'].includes(item.source_id)) {
      lead.status = 'accepted'; lead.decided_by = lead.assignee_user_id; lead.decided_at = isoAt(addDays(item.published_at.slice(0, 10), 2), 10);
      if (!lead.matched_account_id && lead.candidate_ids[0]) lead.matched_account_id = lead.candidate_ids[0];
    }
    truth.leads.push(lead);
  }
  for (const a of truth.accounts) {
    const inp = { orders: truth.orders.filter(o => o.account_id === a.id), activities: truth.activities.filter(x => x.account_id === a.id), signals: truth.signals.filter(s => s.account_id === a.id), today };
    const grade = computeRisk(inp).grade;
    a.truth_next_action = recommend({ ...inp, grade, leads: truth.leads.filter(l => l.matched_account_id === a.id) })[0]?.action_type ?? null;
  }
  return { truth, todayItems };
}

export async function seedDatabase(db: Database.Database, variant: SeedVariant = 'default') {
  const today = seoulDate(now());
  const { truth, todayItems } = buildTruth(today);
  const ds = degrade(truth, 0.5, 42, { forceDup: [4] }); // 시연용 중복 고객 1건 보장(인천바이오팜)
  const password = process.env.SEED_PASSWORD || 'demo1234';

  for (const s of ds.signals) { const r = await summarize(s.title, s.body); s.summary = r.text; s.summary_method = r.method; }

  const collectedToday: Signal[] = [];
  if (variant === 'default') {
    let sid = Math.max(...ds.signals.map(s => s.id)) + 1;
    for (const item of todayItems.filter(i => i.source_type === 'disclosure' || i.source_type === 'news').slice(0, 5)) {
      collectedToday.push(feedToSignal(item, sid++, ds, isoAt(today, 8, 30), await summarize(item.title, item.body)));
    }
  }

  db.transaction(() => {
    for (const t of DELETE_ORDER) db.prepare(`DELETE FROM ${t}`).run();
    const u = db.prepare('INSERT INTO users(id,email,name,role,password_hash) VALUES (?,?,?,?,?)');
    for (const x of ds.users) u.run(x.id, x.email, x.name, x.role, hashPassword(password));
    const a = db.prepare('INSERT INTO accounts(id,name,segment,owner_user_id,status,merged_into_id,truth_churn,truth_next_action) VALUES (?,?,?,?,?,?,?,?)');
    for (const x of ds.accounts) a.run(x.id, x.name, x.segment, x.owner_user_id, 'active', null, x.truth_churn, x.truth_next_action);
    const al = db.prepare('INSERT OR IGNORE INTO account_aliases(account_id, alias, alias_norm) VALUES (?,?,?)');
    for (const x of ds.aliases) al.run(x.account_id, x.alias, normalize(x.alias));
    const o = db.prepare('INSERT INTO orders(account_id,product_family,order_month,amount_krw) VALUES (?,?,?,?)');
    for (const x of ds.orders) o.run(x.account_id, x.product_family, x.order_month, x.amount_krw);
    const act = db.prepare(`INSERT INTO activities(id,account_id,author_user_id,meeting_date,raw_note,needs,products,competitors,complaints,next_step,next_contact_date,sentiment,status,corrected_field_count,verified,recorded_at,confirmed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const x of ds.activities) act.run(x.id, x.account_id, x.author_user_id, x.meeting_date, x.raw_note, x.needs, x.products ? JSON.stringify(x.products) : null, x.competitors ? JSON.stringify(x.competitors) : null, x.complaints, x.next_step, x.next_contact_date, x.sentiment, x.status, 0, x.verified, x.recorded_at, x.confirmed_at);
    const s = db.prepare(`INSERT INTO signals(id,source_type,source_id,raw_org_name,account_id,signal_type,title,body,url,modality,stage,budget_krw,published_at,collected_at,summary,summary_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const x of [...ds.signals, ...collectedToday]) s.run(x.id, x.source_type, x.source_id, x.raw_org_name, x.account_id, x.signal_type, x.title, x.body, x.url, x.modality, x.stage, x.budget_krw, x.published_at, x.collected_at, x.summary, x.summary_method);
    const l = db.prepare(`INSERT INTO leads(id,signal_id,org_name,matched_account_id,match_score,match_status,candidate_ids,modality,stage,budget_krw,recommended_products,confidence,status,reject_reason,assignee_user_id,decided_by,decided_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const x of ds.leads) l.run(x.id, x.signal_id, x.org_name, x.matched_account_id, x.match_score, x.match_status, JSON.stringify(x.candidate_ids), x.modality, x.stage, x.budget_krw, JSON.stringify(x.recommended_products), x.confidence, x.status, x.reject_reason, x.assignee_user_id, x.decided_by, x.decided_at, x.created_at);
  })();

  await refreshDerived(db, { snapshot: false });
  // 과거 스냅샷 7개(주 단위) + 현재
  for (let w = 7; w >= 1; w--) snapshot(db, isoAt(addDays(today, -7 * w), 9));
  for (let w = 7; w >= 1; w--) {
    db.prepare('UPDATE dq_snapshots SET completeness=max(0,completeness-0.012*?), accuracy=max(0,accuracy-0.015*?), timeliness=max(0,timeliness-0.01*?), consistency=max(0,consistency-0.008*?), overall=max(0,round(overall-0.009*?,3)) WHERE computed_at = ?')
      .run(w, w, w, w, w, isoAt(addDays(today, -7 * w), 9));
  }
  snapshot(db);

  writeFeeds(todayItems);
  return { today, accounts: ds.accounts.length, signals: ds.signals.length + collectedToday.length };
}

const normalize = normalizeName;

export function writeFeeds(items: FeedItem[]) {
  const dir = feedDir();
  fs.mkdirSync(dir, { recursive: true });
  const by = (t: string[]) => items.filter(i => t.includes(i.source_type));
  fs.writeFileSync(path.join(dir, 'signals.json'), JSON.stringify(by(['disclosure', 'news']), null, 2));
  fs.writeFileSync(path.join(dir, 'clinical.json'), JSON.stringify(by(['clinical']), null, 2));
  fs.writeFileSync(path.join(dir, 'ntis.json'), JSON.stringify(by(['ntis']), null, 2));
}
export function readFeeds(): FeedItem[] {
  const dir = feedDir();
  return ['signals.json', 'clinical.json', 'ntis.json'].flatMap(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as FeedItem[]; } catch { return []; } });
}

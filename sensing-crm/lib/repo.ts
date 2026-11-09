import type Database from 'better-sqlite3';
import { getDb, json } from './db';
import type { Account, Activity, Alias, Lead, Order, Signal, User } from './domain/types';
import { computeRisk, riskRaw, scoreFromRaw } from './domain/risk';
import { recommend } from './domain/nba';
import { computeQuality, missingFields, type QualityMetrics } from './domain/quality';
import { jaroWinkler, matchOrg, normalizeName } from './domain/names';
import { explain } from './ai';
import { daysBetween, now, seoulDate } from './time';

export const today = () => seoulDate(now());
export const nowIso = () => now().toISOString();

type Row = Record<string, unknown>;
export function rowToActivity(r: Row): Activity {
  return {
    ...(r as unknown as Activity),
    products: json<string[] | null>(r.products as string, null), competitors: json<string[] | null>(r.competitors as string, null),
    ai_products: json<string[] | null>(r.ai_products as string, null), ai_competitors: json<string[] | null>(r.ai_competitors as string, null),
  };
}
export function rowToLead(r: Row): Lead {
  return { ...(r as unknown as Lead), candidate_ids: json<number[]>(r.candidate_ids as string, []), recommended_products: json<string[]>(r.recommended_products as string, []) };
}

export interface Scope { userId: number | null } // null = 전체(관리자)
export function scopeFor(user: User): Scope { return { userId: user.role === 'admin' ? null : user.id }; }

export function scopedAccounts(db: Database.Database, scope: Scope, includeMerged = false): Account[] {
  const rows = db.prepare(`SELECT * FROM accounts WHERE (? IS NULL OR owner_user_id = ?) ${includeMerged ? '' : "AND status='active'"} ORDER BY id`).all(scope.userId, scope.userId) as Account[];
  return rows;
}
export function canAccessAccount(db: Database.Database, user: User, accountId: number): boolean {
  const a = db.prepare('SELECT owner_user_id FROM accounts WHERE id=?').get(accountId) as { owner_user_id: number } | undefined;
  if (!a) return false;
  return user.role === 'admin' || a.owner_user_id === user.id;
}

export function loadAll(db: Database.Database) {
  const accounts = db.prepare('SELECT * FROM accounts').all() as Account[];
  const aliases = db.prepare('SELECT account_id, alias FROM account_aliases').all() as Alias[];
  const orders = db.prepare('SELECT * FROM orders').all() as Order[];
  const activities = (db.prepare('SELECT * FROM activities').all() as Row[]).map(rowToActivity);
  const signals = db.prepare('SELECT * FROM signals').all() as Signal[];
  const leads = (db.prepare('SELECT * FROM leads').all() as Row[]).map(rowToLead);
  return { accounts, aliases, orders, activities, signals, leads };
}

// ---------- 이탈위험 (FR-032)
export function recomputeRisk(db = getDb()) {
  const { accounts, orders, activities, signals } = loadAll(db);
  const t = today(), at = nowIso();
  const up = db.prepare('INSERT OR REPLACE INTO risk_scores(account_id, score, grade, reasons, computed_at) VALUES (?,?,?,?,?)');
  db.prepare("DELETE FROM risk_scores WHERE account_id IN (SELECT id FROM accounts WHERE status='merged')").run();
  const tx = db.transaction(() => {
    for (const a of accounts.filter(x => x.status === 'active')) {
      const r = computeRisk({ orders: orders.filter(o => o.account_id === a.id), activities: activities.filter(x => x.account_id === a.id), signals: signals.filter(s => s.account_id === a.id), today: t });
      up.run(a.id, r.score, r.grade, JSON.stringify(r.factors), at);
    }
  });
  tx();
}
export { riskRaw, scoreFromRaw };

// ---------- 추천 (FR-036, FR-038)
export async function recomputeRecs(db = getDb()) {
  const { accounts, orders, activities, signals, leads } = loadAll(db);
  const t = today(), at = nowIso();
  const grades = new Map((db.prepare('SELECT account_id, grade FROM risk_scores').all() as { account_id: number; grade: '고' | '중' | '저' }[]).map(r => [r.account_id, r.grade]));
  const pending = db.prepare("SELECT account_id, action_type FROM recommendations WHERE status IN ('held','adopted') AND date(created_at) >= date(?, '-30 day')").all(t) as { account_id: number; action_type: string }[];
  const blocked = new Set(pending.map(p => `${p.account_id}:${p.action_type}`));
  const rejected = new Set((db.prepare("SELECT account_id, action_type FROM recommendations WHERE status='rejected' AND date(decided_at) >= date(?, '-30 day')").all(t) as { account_id: number; action_type: string }[]).map(p => `${p.account_id}:${p.action_type}`));
  const rows: unknown[][] = [];
  for (const a of accounts.filter(x => x.status === 'active')) {
    const recs = recommend({ grade: grades.get(a.id) ?? '저', orders: orders.filter(o => o.account_id === a.id), activities: activities.filter(x => x.account_id === a.id), signals: signals.filter(s => s.account_id === a.id), leads: leads.filter(l => l.matched_account_id === a.id), today: t });
    for (const r of recs) {
      if (blocked.has(`${a.id}:${r.action_type}`) || rejected.has(`${a.id}:${r.action_type}`)) continue;
      const ex = await explain(r, a.name);
      rows.push([a.id, r.action_type, r.action_label, r.product_family, r.channel, r.due_date, r.priority, JSON.stringify(r.basis_signal_ids), r.basis_text, ex.text, ex.method, at]);
    }
  }
  const ins = db.prepare('INSERT INTO recommendations(account_id, action_type, action_label, product_family, channel, due_date, priority, basis_signal_ids, basis_text, explanation, explanation_method, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  db.transaction(() => { db.prepare("DELETE FROM recommendations WHERE status='new'").run(); for (const r of rows) ins.run(...r); })();
}

// ---------- 품질 이슈 (FR-013, FR-027, FR-029)
export function detectIssues(db = getDb()) {
  const { accounts, aliases, activities, signals } = loadAll(db);
  const dismissed = new Set((db.prepare("SELECT issue_type||':'||entity_id AS k FROM dq_issues WHERE status IN ('dismissed','resolved')").all() as { k: string }[]).map(r => r.k));
  const active = accounts.filter(a => a.status === 'active');
  const ins = db.prepare('INSERT INTO dq_issues(issue_type, entity, entity_id, account_id, description, raw_name, candidate_account_id, similarity) VALUES (?,?,?,?,?,?,?,?)');
  db.transaction(() => {
    db.prepare("DELETE FROM dq_issues WHERE status='open'").run();
    for (const a of activities) {
      if (!active.some(x => x.id === a.account_id)) continue;
      const miss = missingFields(a);
      if (miss.length && !dismissed.has(`missing_field:${a.id}`)) ins.run('missing_field', 'activity', a.id, a.account_id, `${a.meeting_date} 활동의 필수 항목 누락: ${miss.join(', ')}`, null, null, null);
      const lag = daysBetween(a.meeting_date, a.recorded_at);
      if (lag > 2 && !dismissed.has(`late_entry:${a.id}`)) ins.run('late_entry', 'activity', a.id, a.account_id, `${a.meeting_date} 미팅을 ${lag}일 뒤에 기록`, null, null, null);
    }
    for (const s of signals.filter(s => (s.source_type === 'disclosure' || s.source_type === 'news') && s.account_id === null)) {
      if (dismissed.has(`unresolved_name:${s.id}`)) continue;
      const m = matchOrg(s.raw_org_name, active, aliases);
      const c = m.candidates[0];
      ins.run('unresolved_name', 'signal', s.id, c?.account_id ?? null, `원문 기관명 "${s.raw_org_name}"을(를) 고객에 연결하지 못함`, s.raw_org_name, c?.account_id ?? null, c?.score ?? null);
    }
    for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      const s = jaroWinkler(normalizeName(a.name), normalizeName(b.name));
      if (s >= 0.9) {
        const [primary, dup] = a.id < b.id ? [a, b] : [b, a];
        if (!dismissed.has(`duplicate_account:${dup.id}`)) ins.run('duplicate_account', 'account', dup.id, primary.id, `"${dup.name}"이(가) "${primary.name}"과(와) 중복으로 보임`, dup.name, primary.id, Math.round(s * 1000) / 1000);
      }
    }
  })();
}

// ---------- 품질 지표 (FR-027, FR-028)
export function qualityFor(db: Database.Database, scope: Scope, accountId?: number): QualityMetrics {
  const accs = scopedAccounts(db, scope).filter(a => accountId === undefined || a.id === accountId);
  const ids = new Set(accs.map(a => a.id));
  const { activities, signals } = loadAll(db);
  const issues = db.prepare("SELECT * FROM dq_issues WHERE status='open'").all() as { issue_type: string; entity_id: number; account_id: number | null; candidate_account_id: number | null }[];
  const unresolvedInScope = new Set(issues.filter(i => i.issue_type === 'unresolved_name' && (scope.userId === null && accountId === undefined ? true : i.candidate_account_id !== null && ids.has(i.candidate_account_id))).map(i => i.entity_id));
  const sigs = signals.filter(s => (s.account_id !== null && ids.has(s.account_id)) || (s.account_id === null && unresolvedInScope.has(s.id)));
  const dups = issues.filter(i => i.issue_type === 'duplicate_account' && (ids.has(i.entity_id) || (i.account_id !== null && ids.has(i.account_id)))).length;
  return computeQuality({ activities: activities.filter(a => ids.has(a.account_id)), signals: sigs, accountCount: accs.length || 1, duplicateAccountCount: dups });
}
export function snapshot(db = getDb(), at = nowIso()) {
  const ins = db.prepare('INSERT INTO dq_snapshots(scope, completeness, accuracy, timeliness, consistency, uniqueness, overall, computed_at) VALUES (?,?,?,?,?,?,?,?)');
  const users = db.prepare('SELECT id, role FROM users').all() as { id: number; role: string }[];
  const put = (scopeKey: string, m: QualityMetrics) => ins.run(scopeKey, m.completeness, m.accuracy, m.timeliness, m.consistency, m.uniqueness, m.overall, at);
  put('all', qualityFor(db, { userId: null }));
  for (const u of users) if (u.role === 'kam') put(`user:${u.id}`, qualityFor(db, { userId: u.id }));
}
export function accountQualityMap(db: Database.Database, scope: Scope): Map<number, number> {
  const m = new Map<number, number>();
  for (const a of scopedAccounts(db, scope)) m.set(a.id, qualityFor(db, scope, a.id).overall);
  return m;
}

/** 데이터 변경 뒤 파생값 일괄 재계산 */
export async function refreshDerived(db = getDb(), opts: { snapshot?: boolean } = {}) {
  detectIssues(db); recomputeRisk(db); await recomputeRecs(db);
  if (opts.snapshot !== false) snapshot(db);
}

// ---------- 통합·기각 (FR-030)
export async function resolveIssue(db: Database.Database, issueId: number, action: 'merge' | 'dismiss', userId: number) {
  const issue = db.prepare("SELECT * FROM dq_issues WHERE id=? AND status='open'").get(issueId) as { id: number; issue_type: string; entity_id: number; raw_name: string | null; candidate_account_id: number | null } | undefined;
  if (!issue) return { ok: false as const, code: 'not_found' };
  const at = nowIso();
  if (action === 'dismiss') {
    db.prepare("UPDATE dq_issues SET status='dismissed', resolved_by=?, resolved_at=? WHERE id=?").run(userId, at, issueId);
    await refreshDerived(db);
    return { ok: true as const };
  }
  if (issue.issue_type === 'unresolved_name' && issue.raw_name && issue.candidate_account_id) {
    const target = issue.candidate_account_id, norm = normalizeName(issue.raw_name);
    db.transaction(() => {
      db.prepare('INSERT OR IGNORE INTO account_aliases(account_id, alias, alias_norm) VALUES (?,?,?)').run(target, issue.raw_name, norm);
      const sigs = (db.prepare('SELECT id, raw_org_name FROM signals WHERE account_id IS NULL').all() as { id: number; raw_org_name: string }[]).filter(s => normalizeName(s.raw_org_name) === norm);
      for (const s of sigs) db.prepare('UPDATE signals SET account_id=? WHERE id=?').run(target, s.id);
      const leads = (db.prepare("SELECT id, org_name FROM leads WHERE status='pending' AND matched_account_id IS NULL").all() as { id: number; org_name: string }[]).filter(l => normalizeName(l.org_name) === norm);
      for (const l of leads) db.prepare("UPDATE leads SET matched_account_id=?, match_status='auto', match_score=1 WHERE id=?").run(target, l.id);
      db.prepare("UPDATE dq_issues SET status='resolved', resolved_by=?, resolved_at=? WHERE issue_type='unresolved_name' AND status='open' AND raw_name=?").run(userId, at, issue.raw_name);
    })();
  } else if (issue.issue_type === 'duplicate_account' && issue.candidate_account_id) {
    const dup = issue.entity_id, primary = issue.candidate_account_id;
    db.transaction(() => {
      for (const t of ['activities', 'orders', 'signals']) db.prepare(`UPDATE ${t} SET account_id=? WHERE account_id=?`).run(primary, dup);
      db.prepare('UPDATE leads SET matched_account_id=? WHERE matched_account_id=?').run(primary, dup);
      db.prepare("DELETE FROM recommendations WHERE account_id=? AND status='new'").run(dup);
      db.prepare('UPDATE recommendations SET account_id=? WHERE account_id=?').run(primary, dup);
      db.prepare('DELETE FROM risk_scores WHERE account_id=?').run(dup);
      const name = (db.prepare('SELECT name FROM accounts WHERE id=?').get(dup) as { name: string }).name;
      db.prepare('INSERT OR IGNORE INTO account_aliases(account_id, alias, alias_norm) VALUES (?,?,?)').run(primary, name, normalizeName(name));
      db.prepare('UPDATE account_aliases SET account_id=? WHERE account_id=?').run(primary, dup);
      db.prepare("UPDATE accounts SET status='merged', merged_into_id=? WHERE id=?").run(primary, dup);
      db.prepare("UPDATE dq_issues SET status='resolved', resolved_by=?, resolved_at=? WHERE id=?").run(userId, at, issueId);
    })();
  } else return { ok: false as const, code: 'not_mergeable' };
  await refreshDerived(db);
  return { ok: true as const };
}

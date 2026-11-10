import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('kam','admin')), password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, segment TEXT NOT NULL, owner_user_id INTEGER NOT NULL REFERENCES users(id), status TEXT NOT NULL DEFAULT 'active', merged_into_id INTEGER, truth_churn INTEGER NOT NULL DEFAULT 0, truth_next_action TEXT);
CREATE TABLE IF NOT EXISTS account_aliases (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), alias TEXT NOT NULL, alias_norm TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS signals (id INTEGER PRIMARY KEY, source_type TEXT NOT NULL, source_id TEXT NOT NULL UNIQUE, raw_org_name TEXT NOT NULL, account_id INTEGER REFERENCES accounts(id), signal_type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, url TEXT, modality TEXT, stage TEXT, budget_krw INTEGER, published_at TEXT NOT NULL, collected_at TEXT NOT NULL, summary TEXT NOT NULL, summary_method TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY, signal_id INTEGER NOT NULL UNIQUE REFERENCES signals(id), org_name TEXT NOT NULL, matched_account_id INTEGER REFERENCES accounts(id), match_score REAL NOT NULL, match_status TEXT NOT NULL, candidate_ids TEXT NOT NULL DEFAULT '[]', modality TEXT, stage TEXT, budget_krw INTEGER, recommended_products TEXT NOT NULL DEFAULT '[]', confidence REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending', reject_reason TEXT, assignee_user_id INTEGER NOT NULL REFERENCES users(id), decided_by INTEGER, decided_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), author_user_id INTEGER NOT NULL REFERENCES users(id), meeting_date TEXT NOT NULL, raw_note TEXT NOT NULL,
  ai_needs TEXT, ai_products TEXT, ai_competitors TEXT, ai_complaints TEXT, ai_next_step TEXT, ai_next_contact_date TEXT, ai_sentiment TEXT, ai_method TEXT, ai_confidence REAL,
  needs TEXT, products TEXT, competitors TEXT, complaints TEXT, next_step TEXT, next_contact_date TEXT, sentiment TEXT,
  status TEXT NOT NULL DEFAULT 'draft', corrected_field_count INTEGER NOT NULL DEFAULT 0, verified INTEGER NOT NULL DEFAULT 0, recorded_at TEXT NOT NULL, confirmed_at TEXT);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), product_family TEXT NOT NULL, order_month TEXT NOT NULL, amount_krw INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS risk_scores (account_id INTEGER PRIMARY KEY REFERENCES accounts(id), score INTEGER NOT NULL, grade TEXT NOT NULL, reasons TEXT NOT NULL, computed_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS recommendations (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), action_type TEXT NOT NULL, action_label TEXT NOT NULL, product_family TEXT NOT NULL, channel TEXT NOT NULL, due_date TEXT NOT NULL, priority INTEGER NOT NULL, basis_signal_ids TEXT NOT NULL DEFAULT '[]', basis_text TEXT NOT NULL DEFAULT '', explanation TEXT NOT NULL, explanation_method TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', reject_reason TEXT, decided_by INTEGER, decided_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS dq_issues (id INTEGER PRIMARY KEY, issue_type TEXT NOT NULL, entity TEXT NOT NULL, entity_id INTEGER NOT NULL, account_id INTEGER, description TEXT NOT NULL, raw_name TEXT, candidate_account_id INTEGER, similarity REAL, status TEXT NOT NULL DEFAULT 'open', resolved_by INTEGER, resolved_at TEXT);
CREATE TABLE IF NOT EXISTS dq_snapshots (id INTEGER PRIMARY KEY, scope TEXT NOT NULL, completeness REAL NOT NULL, accuracy REAL NOT NULL, timeliness REAL NOT NULL, consistency REAL NOT NULL, uniqueness REAL NOT NULL, overall REAL NOT NULL, computed_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lab_runs (id INTEGER PRIMARY KEY, run_at TEXT NOT NULL, run_by INTEGER NOT NULL, seed INTEGER NOT NULL, results TEXT, status TEXT NOT NULL, error TEXT);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job_runs (id INTEGER PRIMARY KEY, job TEXT NOT NULL, started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, skipped INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL DEFAULT '', run_by INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_act_account ON activities(account_id);
CREATE INDEX IF NOT EXISTS idx_sig_account ON signals(account_id);
CREATE INDEX IF NOT EXISTS idx_ord_account ON orders(account_id);
`;
export const TABLES = ['users', 'accounts', 'account_aliases', 'signals', 'leads', 'activities', 'orders', 'risk_scores', 'recommendations', 'dq_issues', 'dq_snapshots', 'lab_runs', 'sessions', 'job_runs'];

const g = globalThis as unknown as { __db?: Database.Database };
export function dbPath() { return path.resolve(process.env.DATABASE_PATH || 'data/sensing.db'); }
export function feedDir() { return path.resolve(process.env.DATA_DIR || 'data/feeds'); }

function warnNodeVersion() {
  const [maj, min] = process.versions.node.split('.').map(Number);
  if (maj === 24 && min >= 19 && min <= 21) console.warn(`[sensing-crm] Node.js ${process.versions.node}에는 better-sqlite3가 갑자기 종료되는 결함이 있습니다(nodejs/node#65446). Node.js 24.22 이상 또는 22 LTS로 바꾸는 것을 권장합니다.`);
}
export function openDb(file = dbPath()): Database.Database {
  warnNodeVersion();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  // db.pragma()는 캐시되지 않는 Statement를 만들어 GC 대상이 된다(아래 cachePrepare 설명 참고). exec는 Statement 객체를 만들지 않는다.
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  return cachePrepare(db);
}

/**
 * Prepared statement 캐시.
 * Node.js 24.19~24.21에는 better-sqlite3의 Statement가 GC로 정리될 때
 * `RemoveEnvironmentCleanupHook ... Assertion failed: (env) != nullptr`로 프로세스가 죽는 회귀가 있다(nodejs/node#65446, 24.22.0에서 수정).
 * 같은 SQL의 Statement를 재사용해 GC 대상 자체를 만들지 않음으로써 해당 Node 버전에서도 안전하게 동작하게 하고, 성능도 좋아진다.
 */
function cachePrepare(db: Database.Database): Database.Database {
  const cache = new Map<string, Database.Statement>();
  const original = db.prepare.bind(db);
  (db as unknown as { prepare: (sql: string) => Database.Statement }).prepare = (sql: string) => {
    let st = cache.get(sql);
    if (!st) { st = original(sql); cache.set(sql, st); }
    return st;
  };
  return db;
}
export function getDb(): Database.Database {
  if (!g.__db || !g.__db.open) g.__db = openDb();
  return g.__db;
}
export const json = <T,>(s: string | null | undefined, d: T): T => { try { return s ? JSON.parse(s) as T : d; } catch { return d; } };

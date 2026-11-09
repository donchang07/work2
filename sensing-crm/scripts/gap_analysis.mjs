#!/usr/bin/env node
// bkit gap-detector 대체: feature PRD(설계 기준) 항목과 구현·테스트 결과를 대조해 match rate를 계산한다.
// 사용: node scripts/gap_analysis.mjs <feature> [--json]
import fs from 'node:fs';
import path from 'node:path';

const feature = process.argv[2];
if (!feature) { console.error('usage: gap_analysis.mjs <feature>'); process.exit(2); }
const prd = fs.readFileSync(`docs/00-pm/${feature}.prd.md`, 'utf8');
const canon = fs.readFileSync('docs/PRD.md', 'utf8');

// 1) 소스 코드 수집
const src = [];
const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(f.name)) src.push(fs.readFileSync(p, 'utf8')); } };
for (const d of ['app', 'components', 'lib']) if (fs.existsSync(d)) walk(d);
const code = src.join('\n');

// 2) 테스트 결과 수집 (제목 앞 SC-xxx)
const results = new Map(); // SC → pass(bool)
const mark = (title, pass) => { for (const m of title.matchAll(/SC-\d{3}/g)) results.set(m[0], (results.get(m[0]) ?? true) && pass); };
try {
  const e2e = JSON.parse(fs.readFileSync('test-results/e2e.json', 'utf8'));
  const visit = s => { for (const sp of s.specs ?? []) mark(sp.title, sp.ok); for (const c of s.suites ?? []) visit(c); };
  for (const s of e2e.suites ?? []) visit(s);
} catch { /* no e2e results */ }
try {
  const unit = JSON.parse(fs.readFileSync('test-results/unit.json', 'utf8'));
  for (const f of unit.testResults ?? []) for (const a of f.assertionResults ?? []) mark(`${(a.ancestorTitles ?? []).join(' ')} ${a.title}`, a.status === 'passed');
} catch { /* no unit results */ }

// 3) 설계 항목
const ids = re => [...new Set([...prd.matchAll(re)].map(m => m[1]))];
const els = ids(/^\| (SCR-\d{3}-EL-\d{2}) \|/gm);
const navs = ids(/^\| (NAV-\d{2}) \|/gm);
const frs = [...prd.matchAll(/^\| (FR-\d{3}) \|(.*)$/gm)].map(m => ({ id: m[1], scs: [...new Set([...m[2].matchAll(/SC-\d{3}/g)].map(x => x[0]))] }));
const scs = ids(/^\| (SC-\d{3}) \|/gm);
const datas = ids(/^### (DATA-\d{3}) /gm);
const screens = [...prd.matchAll(/^### (SCR-\d{3}) [^\n]*\n\n- 유형: [^·]+· Route `([^`]+)`/gm)].map(m => ({ id: m[1], route: m[2] }));
const tableOf = {};
for (const m of canon.matchAll(/^### (DATA-\d{3}) (\w+)/gm)) tableOf[m[1]] = m[2];
const tableName = { user: 'users', account: 'accounts', account_alias: 'account_aliases', signal: 'signals', lead: 'leads', activity: 'activities', order: 'orders', risk_score: 'risk_scores', recommendation: 'recommendations', dq_issue: 'dq_issues', dq_snapshot: 'dq_snapshots', lab_run: 'lab_runs', session: 'sessions', job_run: 'job_runs' };

const items = [];
const has = id => code.includes(`"${id}"`) || code.includes(`'${id}'`) || code.includes(`\`${id}\``);
for (const e of [...els, ...navs]) items.push({ kind: 'UI 요소', id: e, ok: has(e) });
for (const s of screens) {
  const r = s.route.split(' ')[0].replace(/\?.*$/, '');
  const dir = path.join('app', '(app)', ...r.split('/').filter(Boolean));
  const ok = fs.existsSync(path.join(dir, 'page.tsx')) || fs.existsSync(path.join('app', ...r.split('/').filter(Boolean), 'page.tsx'));
  const placeholder = ok && fs.readFileSync(fs.existsSync(path.join(dir, 'page.tsx')) ? path.join(dir, 'page.tsx') : path.join('app', ...r.split('/').filter(Boolean), 'page.tsx'), 'utf8').includes('준비 중');
  items.push({ kind: '화면 Route', id: `${s.id} ${r}`, ok: ok && !placeholder });
}
for (const d of datas) { const t = tableName[tableOf[d]]; items.push({ kind: '데이터', id: `${d} ${t}`, ok: new RegExp(`CREATE TABLE IF NOT EXISTS ${t} `).test(code) }); }
for (const s of scs) items.push({ kind: 'SC 테스트', id: s, ok: results.get(s) === true, note: results.has(s) ? (results.get(s) ? 'pass' : 'FAIL') : '테스트 없음' });
for (const f of frs) items.push({ kind: 'FR', id: f.id, ok: f.scs.length > 0 && f.scs.filter(s => scs.includes(s)).every(s => results.get(s) === true), note: f.scs.join(',') });

const matched = items.filter(i => i.ok).length;
const rate = Math.round((matched / items.length) * 1000) / 10;
const byKind = {};
for (const i of items) { byKind[i.kind] ??= [0, 0]; byKind[i.kind][1]++; if (i.ok) byKind[i.kind][0]++; }
const allSc = [...results.values()];
const out = { feature, matchRate: rate, matched, total: items.length, byKind, gaps: items.filter(i => !i.ok), testsTotal: allSc.length, testsFailed: allSc.filter(x => !x).length };
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`[gap] ${feature}: match rate ${rate}% (${matched}/${items.length})`);
  for (const [k, [a, b]] of Object.entries(byKind)) console.log(`  ${k}: ${a}/${b}`);
  for (const g of out.gaps) console.log(`  GAP ${g.kind} ${g.id}${g.note ? ' — ' + g.note : ''}`);
}
process.exit(rate >= 95 ? 0 : 1);

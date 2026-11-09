#!/usr/bin/env node
// PRD 기계 검사 (to-prd validate_prd.mjs 대체본 — 원본 스크립트가 작성 환경에 없어 같은 검사 항목으로 작성)
// 사용: node scripts/validate_prd.mjs docs/PRD.md [--feature]
import fs from 'node:fs';

const file = process.argv[2];
const isFeature = process.argv.includes('--feature');
if (!file) { console.error('usage: validate_prd.mjs <prd.md> [--feature]'); process.exit(2); }
const md = fs.readFileSync(file, 'utf8');
const errors = [];
const warns = [];

// 1. 제목·메타
if (!/^# .+/m.test(md)) errors.push('H1 제목 없음');
if (!/정본 개정 \| v\d+\.\d+/.test(md)) errors.push('정본 개정 vX.Y 표기 없음');
if (!/PRD 스키마 \| screen-first-v2/.test(md)) errors.push('PRD 스키마 screen-first-v2 표기 없음');

// 2. 필수 장
const required = isFeature
  ? ['0. Context', '비목표', '화면 계약', 'Functional Requirements', 'Success Criteria', '데이터 계약', '완료 조건']
  : ['## 0.', '## 1.', '## 2.', '## 3.', '## 4.', '## 5.', '## 6.', '## 7.', '## 8.', '## 9.', '## 10.', '## 11.', '## 12.', '## 13.', '## 14.', '## 15.', '## 부록 A', '## 부록 B'];
for (const h of required) if (!md.includes(h)) errors.push(`필수 섹션 누락: ${h}`);

// 3. placeholder
for (const p of [/\bTODO\b/, /\bTBD\b/, /\?\?\?/, /\[미정\]/, /\{vX\.Y\}/]) {
  if (p.test(md)) errors.push(`placeholder 발견: ${p}`);
}

// 4. ID 정의 수집
const defs = { SCR: new Set(), EL: new Set(), FR: new Set(), SC: new Set(), DATA: new Set(), NG: new Set(), NAV: new Set() };
const dup = [];
const add = (k, id) => { if (defs[k].has(id)) dup.push(id); defs[k].add(id); };
for (const m of md.matchAll(/^### (SCR-\d{3}) /gm)) add('SCR', m[1]);
for (const m of md.matchAll(/^\| (SCR-\d{3}) \| [^|]+\| (인증|대시보드|목록|목록·처리|입력·검토|상세|분석|관리|시스템) /gm)) defs.SCR.add(m[1]);
for (const m of md.matchAll(/^\| (SCR-\d{3}-EL-\d{2}) \|/gm)) add('EL', m[1]);
for (const m of md.matchAll(/^\| (FR-\d{3}) \|/gm)) add('FR', m[1]);
for (const m of md.matchAll(/^\| (SC-\d{3}) \|/gm)) add('SC', m[1]);
for (const m of md.matchAll(/^### (DATA-\d{3}) /gm)) add('DATA', m[1]);
for (const m of md.matchAll(/^\| (NG-\d{2}) \|/gm)) add('NG', m[1]);
for (const m of md.matchAll(/^\| (NAV-\d{2}) \|/gm)) add('NAV', m[1]);
if (dup.length) errors.push(`ID 중복 정의: ${[...new Set(dup)].join(', ')}`);

// 5. 참조 해소 (범위 표기 확장)
const expand = (s) => {
  const out = [];
  for (const m of s.matchAll(/((?:SCR-\d{3}-EL-|FR-|SC-|DATA-|NG-|NAV-|SCR-))(\d+)~(?:\1)?(\d+)/g)) {
    const [_, pre, a, b] = m; const w = a.length;
    for (let i = +a; i <= +b; i++) out.push(pre + String(i).padStart(w, '0'));
  }
  return out;
};
const refs = new Set([...md.matchAll(/\b(SCR-\d{3}-EL-\d{2}|SCR-\d{3}|FR-\d{3}|SC-\d{3}|DATA-\d{3}|NG-\d{2}|NAV-\d{2})\b/g)].map(m => m[1]));
for (const r of expand(md)) refs.add(r);
const kindOf = (id) => id.includes('-EL-') ? 'EL' : id.split('-')[0];
// feature 파생본은 정본 일부만 담으므로 참조 검사는 정본에서만 엄격 적용
const unresolved = [...refs].filter(r => !defs[kindOf(r)].has(r) && !/SC-03[89]/.test(r));
if (unresolved.length) (isFeature ? warns : errors).push(`정의되지 않은 참조: ${unresolved.sort().join(', ')}`);

if (!isFeature) {
  // 6. 시스템 가정 10행
  const assume = md.match(/### 11\.2 시스템 가정[\s\S]*?(?=\n### )/);
  const rows = assume ? assume[0].split('\n').filter(l => /^\| \d+ \|/.test(l)) : [];
  if (rows.length !== 10) errors.push(`시스템 가정 행 수 ${rows.length} ≠ 10`);
  for (const r of rows) if (!/\[(확정|기본값|해당 없음|결정 필요)\]/.test(r)) errors.push(`시스템 가정 상태 라벨 누락: ${r.slice(0, 40)}`);

  // 7. 비목표 표 칸
  for (const l of md.split('\n').filter(l => /^\| NG-\d{2} \|/.test(l))) {
    const cells = l.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 4 || cells.some(c => !c)) errors.push(`비목표 칸 누락: ${cells[0]}`);
  }

  // 8. FR 행 검사: P0 UI FR은 SCR 연결, 검증 라벨, SC 존재
  for (const l of md.split('\n').filter(l => /^\| FR-\d{3} \|/.test(l))) {
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    const [id, , pri, , screen, data, sc, verify] = c;
    if (!/^P[012] \((High|Medium|Low)\)$/.test(pri)) errors.push(`${id} 우선순위 형식`);
    if (pri.startsWith('P0') && !/SCR-|NAV-|해당 없음 — /.test(screen)) errors.push(`${id} P0 화면 연결 없음`);
    if (pri.startsWith('P0') && !/DATA-|해당 없음|환경 변수|전체/.test(data)) errors.push(`${id} P0 데이터 연결 없음`);
    if (!/SC-\d{3}/.test(sc)) errors.push(`${id} 관련 SC 없음`);
    if (!/^\[(E2E|통합|단위|수동)\]/.test(verify)) errors.push(`${id} 검증 라벨 없음`);
  }
  // 9. SC 측정 라벨
  for (const l of md.split('\n').filter(l => /^\| SC-\d{3} \|/.test(l))) {
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (!/^\[(E2E|통합|단위|수동)\]/.test(c[3])) errors.push(`${c[0]} 측정 라벨 없음`);
  }
  // 10. 화면마다 요소 표 + 상태 8행
  const blocks = md.split(/^### (?=SCR-\d{3} )/m).slice(1);
  for (const b of blocks) {
    const id = b.slice(0, 7);
    if (!new RegExp(`^\\| ${id}-EL-\\d{2} \\|`, 'm').test(b)) errors.push(`${id} UI 요소 없음`);
    const states = ['초기', '로딩', '빈', '성공', '검증 오류', '시스템 오류', '권한 없음', '오프라인'];
    for (const s of states) if (!new RegExp(`^\\| ${s} \\|`, 'm').test(b)) errors.push(`${id} 상태 누락: ${s}`);
    if (!/디자인 참고:/.test(b)) errors.push(`${id} 디자인 참고 없음`);
  }
  // 11. 역연결: 모든 FR/SC가 feature 표에 1회 포함
  const feat = md.match(/## 14\. Feature 분해[\s\S]*?## 15\./)?.[0] ?? '';
  const featFR = new Set(expand(feat).filter(x => x.startsWith('FR-')).concat([...feat.matchAll(/FR-\d{3}/g)].map(m => m[0])));
  const featSC = new Set(expand(feat).filter(x => x.startsWith('SC-')).concat([...feat.matchAll(/SC-\d{3}/g)].map(m => m[0])));
  for (const f of defs.FR) if (!featFR.has(f)) errors.push(`${f} feature 미배정`);
  for (const s of defs.SC) if (!featSC.has(s)) errors.push(`${s} feature 미배정`);
  for (const s of defs.SCR) if (!feat.includes(s)) errors.push(`${s} feature 미배정`);
  // 12. 모든 SC가 FR 또는 화면 상태에서 참조됨
  const body = md.replace(/^\| SC-\d{3} \|.*$/gm, '');
  const bodyRefs = new Set([...body.matchAll(/SC-\d{3}/g)].map(m => m[0]).concat(expand(body).filter(x => x.startsWith('SC-'))));
  for (const s of defs.SC) if (!bodyRefs.has(s)) warns.push(`${s} 역참조 없음`);
}

const counts = Object.fromEntries(Object.entries(defs).map(([k, v]) => [k, v.size]));
console.log(`[validate] ${file}`);
console.log(`  정의 수: ${JSON.stringify(counts)}`);
for (const w of warns) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log(errors.length ? `  결과: 실패 (${errors.length})` : '  결과: 통과');
process.exit(errors.length ? 1 : 0);

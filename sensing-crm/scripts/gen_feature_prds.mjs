#!/usr/bin/env node
// 정본(docs/PRD.md)에서 feature 파생본(docs/00-pm/{feature}.prd.md)을 생성한다. 파생본은 직접 편집하지 않는다.
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2] ?? 'docs/PRD.md';
const outDir = process.argv[3] ?? 'docs/00-pm';
const md = fs.readFileSync(src, 'utf8');
const rev = md.match(/정본 개정 \| (v\d+\.\d+)/)[1];

const section = (start, end) => {
  const i = md.indexOf(start); const j = end ? md.indexOf(end, i + 1) : md.length;
  return md.slice(i, j).trim();
};
const expand = (s) => {
  const ids = new Set([...s.matchAll(/\b(SCR-\d{3}|FR-\d{3}|SC-\d{3}|DATA-\d{3}|NAV-\d{2})\b/g)].map(m => m[1]));
  for (const m of s.matchAll(/((?:FR-|SC-|DATA-|NAV-|SCR-))(\d+)~(?:\1)?(\d+)/g)) {
    const [, pre, a, b] = m;
    for (let i = +a; i <= +b; i++) ids.add(pre + String(i).padStart(a.length, '0'));
  }
  return ids;
};
const rowsWhere = (re, ids) => md.split('\n').filter(l => { const m = l.match(re); return m && ids.has(m[1]); });
const tableHead = (marker) => { const i = md.indexOf(marker); return md.slice(i).split('\n').slice(0, 2).join('\n'); };

const featTable = section('## 14. Feature 분해', '## 15.');
const features = featTable.split('\n').filter(l => /^\| \d+ \| [a-z0-9-]+ \|/.test(l)).map(l => {
  const c = l.split('|').slice(1, -1).map(x => x.trim());
  return { order: c[0], slug: c[1], screens: c[2], fr: c[3], sc: c[4], data: c[5], deps: c[6], size: c[7], row: l };
});

const ngTable = section('### 3.2 비목표', '## 4.');
const design = section('## 9. 브랜드·디자인', '## 10.');
const sys = section('## 11. 레벨·스택·시스템 가정', '## 12.');
const nfr = section('### 6.1 비기능 요구사항', '## 7.');
const bkit = section('## 15. bkit 실행 계약', '---\n\n## 부록 A');
const roles = section('### 4.1 역할', '### 4.2');
const anchor = section('### Context Anchor', '---');

fs.mkdirSync(outDir, { recursive: true });
for (const f of features) {
  const scr = expand(f.screens), fr = expand(f.fr), sc = expand(f.sc), data = expand(f.data);
  const nav = [...scr].filter(x => x.startsWith('NAV-'));
  const screenBlocks = [...scr].filter(x => x.startsWith('SCR-')).sort().map(id => {
    const i = md.indexOf(`### ${id} `); const j = md.indexOf('\n### ', i + 1);
    return md.slice(i, j).trim();
  });
  const frRows = rowsWhere(/^\| (FR-\d{3}) \|/, fr);
  const scRows = rowsWhere(/^\| (SC-\d{3}) \|/, sc);
  const dataBlocks = [...data].sort().map(id => {
    const i = md.indexOf(`### ${id} `); const j = md.indexOf('\n### ', i + 1);
    const k = md.indexOf('\n## ', i + 1);
    return md.slice(i, Math.min(j < 0 ? Infinity : j, k < 0 ? Infinity : k)).trim();
  });
  const scrIds = [...scr].filter(x => x.startsWith('SCR-'));
  const errSec = section('## 8. 오류·경계 처리', '## 9.');
  const errRows = errSec.split('\n').filter(l => /^\| [^|]+ \| (SCR-\d{3})/.test(l) && scrIds.some(s => l.split('|')[2].includes(s)));
  const navSection = nav.length ? `### 메뉴·인증\n\n${section('### 5.3 메뉴 (NAV)', '### 5.5')}\n` : '';

  const out = `# ${f.slug} — Feature PRD (Sensing CRM)

| 항목 | 값 |
|---|---|
| 정본 | \`docs/PRD.md\` |
| 정본 개정 | ${rev} |
| PRD 스키마 | screen-first-v2 |
| feature | ${f.slug} (순서 ${f.order}, 규모 ${f.size}) |
| 의존 | ${f.deps} |

> 이 파일은 정본에서 \`scripts/gen_feature_prds.mjs\`로 생성한 파생본이다. 직접 편집하지 말고 정본을 고친 뒤 다시 생성한다.

## 0. Context

${anchor}

### 역할

${roles.replace('### 4.1 역할\n\n', '')}

## 비목표 (정본 3.2 전체)

${ngTable.replace('### 3.2 비목표\n\n', '')}

## 화면 계약

포함: ${f.screens}

${navSection}
${screenBlocks.join('\n\n')}

## Functional Requirements

${tableHead('| ID | 판정 가능한 요구사항 |')}
${frRows.join('\n')}

### 비기능 요구사항 (공통)

${nfr.replace('### 6.1 비기능 요구사항\n\n', '')}

## Success Criteria

${tableHead('| ID | 판정 기준 |')}
${scRows.join('\n')}

## 오류·경계 처리

${tableHead('| 상황 | 발생 화면·요소 |')}
${errRows.join('\n')}

## 데이터 계약

${dataBlocks.join('\n\n')}

## 디자인 기준

${design.replace('## 9. 브랜드·디자인\n\n', '')}

## 스택·시스템 가정·규칙

${sys.replace('## 11. 레벨·스택·시스템 가정\n\n', '')}

## 완료 조건

${bkit.replace('## 15. bkit 실행 계약\n\n', '').replace('첫 명령: `/pdca plan foundation-auth`', `이 feature 첫 명령: \`/pdca plan ${f.slug}\``)}
`;
  fs.writeFileSync(path.join(outDir, `${f.slug}.prd.md`), out);
  console.log(`wrote ${f.slug}.prd.md  SCR:${screenBlocks.length} FR:${frRows.length} SC:${scRows.length} DATA:${dataBlocks.length}`);
}

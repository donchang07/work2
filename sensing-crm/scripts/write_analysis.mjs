#!/usr/bin/env node
// Check 단계 기록: gap 분석 결과 + 실제 테스트 실행 결과를 analysis 문서로 저장
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [feature, iteration = '1'] = process.argv.slice(2);
let gap;
try { gap = JSON.parse(execFileSync('node', ['scripts/gap_analysis.mjs', feature, '--json'], { encoding: 'utf8' })); }
catch (e) { gap = JSON.parse(e.stdout); }
const unit = JSON.parse(fs.readFileSync('test-results/unit.json', 'utf8'));
const e2e = JSON.parse(fs.readFileSync('test-results/e2e.json', 'utf8'));
const pass = gap.matchRate >= 95 && unit.numFailedTests === 0 && e2e.stats.unexpected === 0;
const doc = `# Analysis — ${feature} (Check, 반복 ${iteration})

| 항목 | 값 |
|---|---|
| 분석 시각 | ${new Date().toISOString()} |
| 기준 | \`docs/00-pm/${feature}.prd.md\` (정본 v1.1), 설계 \`docs/02-design/features/${feature}.design.md\` |
| gap 분석 | \`npm run gap -- ${feature}\` |
| **match rate** | **${gap.matchRate}%** (${gap.matched}/${gap.total}) — 기준 95% |
| 단위 테스트 \`npm run test\` | ${unit.numPassedTests}/${unit.numTotalTests} 통과 |
| E2E \`npm run test:e2e\` | ${e2e.stats.expected} 통과 · ${e2e.stats.unexpected} 실패 · ${e2e.stats.skipped} 건너뜀 (${Math.round(e2e.stats.duration / 1000)}초) |
| **판정** | ${pass ? '✅ 두 관문 통과 → Report 진행' : '❌ 미달 → Act(iterate)'} |

## 항목별 일치

| 종류 | 일치 |
|---|---|
${Object.entries(gap.byKind).map(([k, [a, b]]) => `| ${k} | ${a}/${b} |`).join('\n')}

## 남은 gap

${gap.gaps.length ? gap.gaps.map(g => `- ${g.kind} ${g.id}${g.note ? ' — ' + g.note : ''}`).join('\n') : '없음'}
`;
fs.writeFileSync(`docs/03-analysis/${feature}.analysis.md`, doc);
console.log(`analysis written: match ${gap.matchRate}% · unit ${unit.numPassedTests}/${unit.numTotalTests} · e2e ${e2e.stats.expected}/${e2e.stats.expected + e2e.stats.unexpected} → ${pass ? 'PASS' : 'FAIL'}`);
process.exit(pass ? 0 : 1);

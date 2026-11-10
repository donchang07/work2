#!/usr/bin/env bash
# PDCA Check: 단위·E2E 전체 실행 → gap 분석 → analysis 기록
set -u
cd "$(dirname "$0")/.."
feature="$1"; iter="${2:-1}"
npx playwright test --trace off > test-results/e2e.log 2>&1; tail -3 test-results/e2e.log
npx vitest run > test-results/unit.log 2>&1; grep -E "Tests " test-results/unit.log
node scripts/gap_analysis.mjs "$feature"
node scripts/write_analysis.mjs "$feature" "$iter"

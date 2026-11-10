# 착수 게이트 — data-quality

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/data-quality.prd.md` (정본 v1.1에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **착수 가능** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/data-quality.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-007 · FR-027~FR-031 · SC-025~SC-027 · DATA-010, DATA-011 |
| 의존 | meeting-note, signal-briefing |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 없음 (정본 M-1 v1.1에서 해소) |
| 참고 | 지표 계산 함수(11.5)는 quality-lab에서 재사용. |

## 다음 행동

`/pdca plan data-quality`

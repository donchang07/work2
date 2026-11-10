# 착수 게이트 — next-best-action

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/next-best-action.prd.md` (정본 v1.1에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **착수 가능** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/next-best-action.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-009 · FR-036~FR-038 · SC-030, SC-031 · DATA-009 |
| 의존 | churn-risk, lead-inbox |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 없음 (정본 M-1 v1.1에서 해소) |
| 참고 | 추천 함수(11.7)는 순수 함수로 구현해 quality-lab에서 재사용. |

## 다음 행동

`/pdca plan next-best-action`

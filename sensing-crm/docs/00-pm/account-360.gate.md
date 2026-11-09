# 착수 게이트 — account-360

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/account-360.prd.md` (정본 v1.0에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **조건부 착수** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/account-360.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-005, SCR-006 · FR-039~FR-042 · SC-032, SC-033 · DATA-002, DATA-003, DATA-007 |
| 의존 | churn-risk, next-best-action |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 정본 M-1 상속 — bkit 계약 [검증 기준] |
| 참고 | 위험·추천·품질 카드가 앞선 feature 결과를 읽는다. |

## 다음 행동

`/pdca plan account-360`

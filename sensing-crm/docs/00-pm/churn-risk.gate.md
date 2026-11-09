# 착수 게이트 — churn-risk

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/churn-risk.prd.md` (정본 v1.0에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **조건부 착수** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/churn-risk.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-008 · FR-032~FR-035 · SC-028, SC-029 · DATA-008 |
| 의존 | data-quality |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 정본 M-1 상속 — bkit 계약 [검증 기준] |
| 참고 | 점수 함수(11.6)는 순수 함수로 구현해 quality-lab에서 재사용. |

## 다음 행동

`/pdca plan churn-risk`

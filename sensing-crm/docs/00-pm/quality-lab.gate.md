# 착수 게이트 — quality-lab

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/quality-lab.prd.md` (정본 v1.0에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **조건부 착수** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/quality-lab.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-010 · FR-043~FR-045 · SC-034~SC-036 · DATA-012 |
| 의존 | churn-risk, next-best-action, data-quality |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 정본 M-1 상속 — bkit 계약 [검증 기준] |
| 참고 | SC-034 목표값은 [가설](m-1). 실측 후 정본 개정 가능. |

## 다음 행동

`/pdca plan quality-lab`

# 착수 게이트 — foundation-auth

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/foundation-auth.prd.md` (정본 v1.0에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **조건부 착수** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/foundation-auth.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-001, SCR-012, NAV-01~NAV-12 · FR-001~FR-008 · SC-001~SC-010, SC-037, SC-040 · DATA-001, DATA-002, DATA-003, DATA-007, DATA-013 |
| 의존 | 없음 |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 정본 M-1 상속 — bkit 계약 [검증 기준] |
| 참고 | 모든 후속 feature의 기반(스키마·시드 전체 포함). SC-037·SC-040 공통 E2E도 여기서 기반을 만든다. |

## 다음 행동

`/pdca plan foundation-auth`

# 착수 게이트 — lead-inbox

| 항목 | 값 |
|---|---|
| 대상 | `docs/00-pm/lead-inbox.prd.md` (정본 v1.0에서 생성) |
| 검사일 | 2026-11-09 |
| 판정 | **조건부 착수** (Blocker 0) |
| 기계 검사 | `node scripts/validate_prd.mjs docs/00-pm/lead-inbox.prd.md --feature` → 통과 |
| 범위 | 화면 SCR-003 · FR-016~FR-020 · SC-016~SC-019 · DATA-005 |
| 의존 | signal-briefing |

## 결함

| 등급 | 내용 |
|---|---|
| Major | 정본 M-1 상속 — bkit 계약 [검증 기준] |
| 참고 | 매칭 유사도 함수(11.8)는 data-quality와 공유하므로 lib으로 분리. |

## 다음 행동

`/pdca plan lead-inbox`

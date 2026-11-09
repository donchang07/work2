# Plan — next-best-action

| 항목 | 값 |
|---|---|
| feature | next-best-action (PDCA 7/9) |
| 범위 | SCR-009 다음 행동 추천(O-2), AI-3 근거 설명 |
| FR / SC | FR-036~FR-038 / SC-030, SC-031 (+ SC-040 추천 부분) |

## 목표
11.7 규칙으로 고객당 최대 3개 다음 행동을 만들고, KAM이 채택·보류·거절(사유 필수)한다. 추천은 결정적 규칙, AI는 설명 문장만 만든다.

## 작업 순서
1. `GET /api/actions`, `POST /api/actions/{id}`
2. SCR-009 화면(탭·카드·인라인 거절 사유)
3. 단위·통합: SC-030 / E2E: SC-031, SC-040

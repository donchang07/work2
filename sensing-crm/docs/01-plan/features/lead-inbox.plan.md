# Plan — lead-inbox

| 항목 | 값 |
|---|---|
| feature | lead-inbox (PDCA 3/9) |
| 범위 | SCR-003 리드 인박스(A-2) |
| FR / SC | FR-016~FR-020 / SC-016~SC-019 (+ SC-040 리드 부분) |

## 목표
임상 승인·국가 과제 신호에서 만든 리드를 KAM이 수락·거절하고 관리자가 담당자를 지정한다. 기관명 매칭(11.8)의 경계값을 단위 테스트로 고정한다.

## 작업 순서
1. `GET /api/leads`, `POST /api/leads/[id]`(accept/reject/assign)
2. SCR-003 화면(탭·표·인라인 거절 사유·매칭 선택·담당자)
3. 단위: SC-016 / E2E: SC-017~SC-019, SC-040

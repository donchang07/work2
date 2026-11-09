# Design — signal-briefing

## API
| 메서드 | 경로 | 권한 | 응답 |
|---|---|---|---|
| GET | `/api/briefing?account={id}` | 로그인 | `{ dateLabel, tiles:{signals,highRisk,pendingLeads}, accounts[], cards[] }` — 카드: 오늘 수집(collected_at의 Seoul 날짜 = 오늘), KAM은 담당 고객, 관리자는 전체(미연결 신호 포함) |
| GET | `/api/ops` | 관리자 | `{ pendingFeed, convertible, running, aiStatus, logs[] }` |
| POST | `/api/ops/collect` | 관리자 | `{ count, skipped }` — 피드 3종에서 source_id 미적재 항목 적재, 정확 일치만 해소, 이후 파생값 재계산 |
| POST | `/api/ops/convert` | 관리자 | `{ count }` — 리드 없는 임상·과제 신호 → 리드 |
| POST | `/api/ops/reset` | 관리자 | `{ ok }` — 시드 재생성 후 reset 로그 1행 |

- 동시 실행: `job_runs.status='running'`이 있으면 409. 화면은 실행 중 다른 버튼 비활성.
- 요약: `summarize()` (AI 모드별: live → Claude, mock → 결정적 3줄, off/fail → 원문 앞 120자).

## 화면
- SCR-002: StatTile 3개(리드 타일 클릭 → `/leads`), 고객 Select, 카드(신호유형 Badge·요약·출처 링크·수집 시각·EL-05 요약 방식), 빈 상태(관리자만 EL-09).
- SCR-011: 작업 Card 3개, EL-06 AI 상태, EL-05 로그 표, EL-04 초기화 모달, EL-07 Toast.
- 시스템 오류: `SCR-002-ERROR`, `SCR-011-ERROR` 배너 + 다시 시도.

## 테스트
`tests/e2e/signal-briefing.spec.ts` — SC-011~SC-015, SC-040(브리핑)

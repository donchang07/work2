# Design — data-quality

## 지표 계산 (`lib/domain/quality.ts`, 순수 함수)
11.5 정의. 일관성은 **공시·뉴스 신호**의 고객 연결 비율로 계산한다(임상·과제는 신규 기관이 정상적으로 미연결일 수 있어 리드 매칭 단계에서 따로 다룸). 범위: 관리자=전체, KAM=담당 고객(미해소 신호는 후보 고객이 담당 범위일 때 포함).

## 통합 처리 (FR-030)
| 이슈 유형 | 승인 시 |
|---|---|
| unresolved_name | 원문 이름을 후보 고객 별칭으로 등록 → 같은 원문(정규화 일치)의 미연결 신호를 연결, 대기 리드를 auto 매칭 → 같은 원문 이슈 모두 resolved |
| duplicate_account | 보조 고객의 활동·주문·신호·리드를 주 고객으로 이전, 보조 고객 merged·별칭 등록, 미결 추천·위험 점수 삭제 → resolved |
| 기각("다른 고객") | dismissed (다시 감지하지 않음) |
처리 후 `refreshDerived()`로 이슈·위험·추천 재계산과 스냅샷 1개 추가.

## API
- `GET /api/quality?account=&type=` → `{ metrics, trend[], issues[], queue[], canMerge }`
- `POST /api/quality/recompute` → 스냅샷 추가
- `POST /api/quality/issues/{id} {action:'merge'|'dismiss'}` → 관리자만(KAM 403)

## 화면
StatTile 6개(종합 + 5개, 각 ⓘ 정의 툴팁) → LineChart(최근 8개, `data-points`) → 좌 이슈 표(유형 필터) / 우 통합 대기열. 오류 `SCR-007-ERROR`.

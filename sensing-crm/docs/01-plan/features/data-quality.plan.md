# Plan — data-quality

| 항목 | 값 |
|---|---|
| feature | data-quality (PDCA 5/9) |
| 범위 | SCR-007 데이터 품질 대시보드 |
| FR / SC | FR-027~FR-031 / SC-025~SC-027 (+ SC-040 품질 부분) |

## 목표
11.5 정의대로 5개 품질 지표와 종합 점수를 범위별로 계산·표시하고, 품질 이슈 목록과 고객명 통합 대기열(미해소 기관명·중복 고객)을 관리자가 처리하게 한다. 이 화면이 강의의 "자동화가 품질을 만든다"를 보여 주는 중심 화면이다.

## 작업 순서
1. `lib/repo.ts`에 통합(merge)·기각(dismiss) 처리 추가
2. API: `GET /api/quality`, `POST /api/quality/recompute`, `POST /api/quality/issues/{id}`
3. 차트 컴포넌트(Recharts LineChart/BarChart)
4. 단위: SC-025 / E2E: SC-026, SC-027, SC-040

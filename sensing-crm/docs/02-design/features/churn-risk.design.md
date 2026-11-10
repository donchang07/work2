# Design — churn-risk

- 계산: `lib/domain/risk.ts` (`riskRaw` → `scoreFromRaw`), 순수 함수. 확정 활동만 사용, 기준일 = 오늘(Asia/Seoul).
- 저장: `risk_scores.reasons`에 5요인 전체(원값·정규화·가중치·기여)를 JSON으로 저장, 화면 근거 Tag는 기여 상위 3개(0 제외).
- `GET /api/risk?grade=` → 범위 내 고객, 점수 내림차순, 고객별 품질 종합 점수(`qualityFor`) 포함 → 70% 미만이면 경고 Badge.
- `POST /api/risk/recompute` → 위험·추천·이슈 재계산(스냅샷 없음).
- 근거 모달: 요인 / 원값 / 정규화 / 가중치 / 기여 표 + 계산식 설명.
- 행 클릭 → 고객 360. 오류 `SCR-008-ERROR`.

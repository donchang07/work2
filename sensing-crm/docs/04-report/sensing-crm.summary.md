# Sensing CRM — 전체 PDCA 결과 요약

| feature | Check 반복 | match rate | 비고 |
|---|---|---|---|
| foundation-auth | 1 | 100% (48/48) | 대비·모바일 상단바 Act |
| signal-briefing | 3 | 100% (33/33) | 1회차 93.9% → 세션 보존·대비·문서 제목 Act |
| lead-inbox | 1 | 100% (21/21) | |
| meeting-note | 1 | 100% (27/27) | |
| data-quality | 1 | 100% (20/20) | |
| churn-risk | 1 | 100% (15/15) | |
| next-best-action | 1 | 100% (17/17) | |
| account-360 | 1 | 100% (24/24) | |
| quality-lab | 1 | 100% (16/16) | SC-034 가설 충족 |

- 최종 회귀: 단위 20/20, E2E 54/54(Chromium, 프로덕션 빌드), 주요 API p95 78ms
- 기준: match rate 95% 이상 + 테스트 전체 통과(사용자 지시). 모든 feature가 기준을 넘은 뒤에만 다음 feature로 진행
- bkit 미설치 환경이라 같은 절차·산출물 경로로 수동 PDCA, gap 분석은 `scripts/gap_analysis.mjs`(UI 요소 ID·화면 Route·데이터 테이블·SC 테스트 통과·FR 연결 SC 통과 대조)

# Plan — signal-briefing

| 항목 | 값 |
|---|---|
| feature | signal-briefing (PDCA 2/9) |
| 기준 | `docs/00-pm/signal-briefing.prd.md` (정본 v1.1) |
| 범위 | SCR-002 오늘의 브리핑(A-1), SCR-011 데이터 운영 |
| FR / SC | FR-009~FR-015 / SC-011~SC-015 (+ SC-040 브리핑 부분) |

## 목표
1. 오늘(Asia/Seoul) 수집된 신호를 사용자 범위 안에서 카드로 보여 준다(AI-2 요약, 대체 규칙).
2. 관리자가 피드 수집(중복 제외·기관명 해소·미해소 이슈)·리드 변환·데모 초기화를 실행하고 로그를 남긴다.

## 작업 순서
1. `lib/jobs.ts`: collectSignals / convertLeads / resetDemo + job_runs 기록, 동시 실행 차단
2. API: `GET /api/briefing`, `GET /api/ops`, `POST /api/ops/{collect,convert,reset}`
3. 화면: SCR-002, SCR-011
4. E2E: SC-011~SC-015, SC-040(브리핑)

## 위험
- 리드 변환(FR-016)은 lead-inbox feature 범위지만 SCR-011-EL-02 버튼이 이 화면에 있음 → 실행 함수는 여기서 만들고 매칭·리드 규칙 검증(SC-016)은 lead-inbox에서 수행

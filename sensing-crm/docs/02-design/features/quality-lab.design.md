# Design — quality-lab

## 평가 (`evaluate(truth, r)`)
1. `degrade(truth, r, 42)` — 공통 난수로 r↑ ⇒ 열화 집합 ⊆ (단조성)
2. 품질: `computeQuality`(중복 고객 수 = 열화로 생긴 보조 고객 수)
3. 위험: 모든 고객 레코드(보조 포함)에 `computeRisk` → 등급
4. 재현율 = 정답 이탈 고객(주 레코드) 중 고등급 / 6, 정밀도 = 고등급 레코드 중 주 고객이 정답 이탈인 비율(0건이면 0)
5. 추천 적중률 = 정답 다음 행동(정답 세계에서 `recommend` 1순위)이 열화 데이터 상위 3 추천에 포함된 고객 비율

## API
- `GET /api/lab` → `{ runs[] (최근 10), latest }` (관리자)
- `POST /api/lab/run` → lab_runs에 running 기록 → 평가 → done(results JSON) / failed(error) (관리자). 운영 DB 데이터는 읽지 않고 시드 정답 세계를 오늘 기준으로 다시 만든다.

## 화면
설명 Card → 실행 버튼(실행 중 "5개 데이터셋 평가 중") → 비교 표(행 4지표 × 열 5비율, `data-ratio`) → LineChart(x=자동화 비율, `data-points`=5) → 핵심 메시지 callout → 이력 표(행 클릭 시 해당 결과 표시). 오류 EL-07.

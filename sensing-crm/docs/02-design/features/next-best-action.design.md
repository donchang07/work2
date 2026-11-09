# Design — next-best-action

- 생성: `lib/domain/nba.ts recommend()` 순수 함수 → `recomputeRecs()`가 status='new'만 갈아끼움. 최근 30일 채택·보류·거절된 같은 (고객, 행동 유형)은 다시 만들지 않음 → 중복 미결 추천 없음.
- 설명: `explain()` — live: Claude 1~2문장, mock: 템플릿(설명: AI 표기), off/fail: 템플릿(설명: 규칙).
- API: `GET /api/actions?status=new|adopted|closed&account=` → `{counts, items[], accountName}`; `POST /api/actions/{id} {action:'adopt'|'hold'|'reject', reason?}` — 거절 사유 ∈ {이미 진행 중, 시점 부적절, 근거 부정확, 기타} 필수(400), 상태 전이 위반 409, 범위 밖 403.
- 화면: 탭(새 추천/채택/보류·거절) → 우선순위 카드(우선순위 Badge·고객·행동·제품군·채널·기한·설명·근거 신호 링크). 근거 링크 → 고객 360. 오류 `SCR-009-ERROR`.

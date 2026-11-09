# Report — next-best-action

| 항목 | 값 |
|---|---|
| PDCA | Plan → Design → Do → Check 1(100%, 전체 통과 ✅) → Report |
| match rate | 100% (17/17) |
| 테스트 | 단위 15/15(SC-030 3건: 규칙 매핑·상한·재계산 중복 없음), E2E 45/45(누적) |

## 구현 결과
- 11.7 표 A·B 규칙의 결정적 추천(고객당 최대 3건, 우선순위순), 30일 내 처리된 같은 행동은 재생성 안 함
- AI-3 근거 설명(live Claude / mock·off 템플릿), 설명 출처 Badge
- 채택·보류·거절(사유 필수), 상태 전이 검사, 고객 필터, 근거 신호 링크

## 다음
`/pdca plan account-360`

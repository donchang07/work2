# Report — meeting-note

| 항목 | 값 |
|---|---|
| PDCA | Plan → Design → Do → Check 1(100%, 전체 통과 ✅) → Report |
| match rate | 100% (27/27) |
| 테스트 | 단위 5/5, E2E 31/31(누적) |

## 구현 결과
- 메모 입력 즉시 검증(고객·미팅일·10~4,000자), 서버 재검증
- AI-1 구조화: live(Claude, 10초 타임아웃·스키마 검사)·mock·fail·off 모드, 실패 시 규칙 기반 추출기로 대체하고 경고 배너
- AI 제안값(ai_*)과 사람 확정값 분리 저장, 수정 필드 수 기록 → 품질 지표(정확성)의 원천
- 확정 취소(24시간), 작성 취소 모달, 초안 폐기

## Do 중 고친 것
- `Card` 컴포넌트의 `title` 속성 타입 충돌(HTML 속성과 React 노드) 수정

## 다음
`/pdca plan data-quality`

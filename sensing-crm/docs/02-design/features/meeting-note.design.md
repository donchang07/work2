# Design — meeting-note

## 흐름
1. 고객·미팅일·메모 입력(클라이언트 즉시 검증, 첫 입력 후 오류 표시, 유효하지 않으면 EL-04 비활성)
2. `POST /api/notes/structure` → 서버 재검증 → `extractNote()` → **초안 활동 생성**(ai_* 저장, status=draft, recorded_at=지금) → 제안값 반환
3. DiffField 7개: AI 제안(보라색 캡션) + 편집 입력, 값이 다르면 "수정됨"
4. `POST /api/notes/{id}/confirm` → 필수(니즈·다음 단계·고객 반응) 검증 → 확정 필드·corrected_field_count·verified=1·confirmed_at 저장 → 파생값 재계산
5. 취소: 입력값이 있으면 모달. 초안이 이미 있으면 `discard`로 삭제
6. 확정 취소: 본인·확정 후 24시간 이내 → status=draft, verified=0 (AI 원값 보존)

## API
| 경로 | 오류 |
|---|---|
| `POST /api/notes/structure {accountId, meetingDate, note}` | 400 validation(필드별 메시지), 403 범위 밖 |
| `POST /api/notes/{id}/confirm {needs, products[], competitors[], complaints, next_step, next_contact_date, sentiment}` | 400 필수 누락, 403 타인 기록 |
| `POST /api/notes/{id}/unconfirm` | 409 기한 경과·상태 |
| `POST /api/notes/{id}/discard` | 초안만 삭제 |

- AI 실패(`failed=true`) → EL-11 경고 배너, 배지 "추출: 규칙 기반". 저장은 계속 가능.
- 저장 실패 → `SCR-004-ERROR` 배너, 입력값 유지.

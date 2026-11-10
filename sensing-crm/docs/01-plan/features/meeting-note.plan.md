# Plan — meeting-note

| 항목 | 값 |
|---|---|
| feature | meeting-note (PDCA 4/9) |
| 범위 | SCR-004 미팅 노트(A-5), AI-1 구조화 |
| FR / SC | FR-021~FR-026 / SC-020~SC-024 |

## 목표
미팅 메모를 AI(또는 규칙 기반 대체)로 7개 필드로 구조화하고, KAM이 필드별로 확인·수정해 확정 저장한다. AI 제안값(ai_*)과 사람 확정값을 분리 저장하고 수정 필드 수를 남긴다(품질 지표의 원천).

## 작업 순서
1. API: `GET /api/notes`, `POST /api/notes/structure`, `POST /api/notes/{id}/confirm|unconfirm|discard`
2. 화면: 2단(입력 / 구조화 결과), 최근 기록, 취소 확인 모달
3. E2E: SC-020~SC-024

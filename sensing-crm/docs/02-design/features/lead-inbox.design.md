# Design — lead-inbox

## API
| 메서드 | 경로 | 요청 | 규칙 |
|---|---|---|---|
| GET | `/api/leads?status=` | — | KAM: assignee=본인, 관리자: 전체. 응답 `{counts, leads[], kams[]}`; 리드에 후보 고객명·점수 포함 |
| POST | `/api/leads/{id}` | `{action:'accept', accountId?: number \| 'new'}` | auto면 accountId 생략 가능. candidate·new는 accountId 필수(400 `need_account`). 'new' → 고객 생성(owner=수락자, 세그먼트: 임상=바이오텍, 과제=대학·연구소, 소재·배터리=반도체·배터리) |
| POST | `/api/leads/{id}` | `{action:'reject', reason}` | 사유 ∈ {중복, 사업 범위 밖, 정보 부족} 필수(400 `need_reason`) |
| POST | `/api/leads/{id}` | `{action:'assign', userId}` | 관리자만(403) |

수락·거절은 pending 상태에서만(409). 수락 후 파생값(추천 등) 재계산.

## 화면
- 표 행마다 `data-lead-id`, `data-match-status`. 상호작용 열이 있어 모바일에서는 카드 변환 대신 표 가로 스크롤(5.6 반응형 예외, 화면 폭 안에서 표만 스크롤).
- 거절: 첫 클릭 → 사유 Select(EL-05) 인라인 노출, 두 번째 클릭 → 제출. 사유 없으면 EL-10.
- 시스템 오류: `SCR-003-ERROR`.

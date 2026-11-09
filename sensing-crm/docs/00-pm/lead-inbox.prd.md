# lead-inbox — Feature PRD (Sensing CRM)

| 항목 | 값 |
|---|---|
| 정본 | `docs/PRD.md` |
| 정본 개정 | v1.0 |
| PRD 스키마 | screen-first-v2 |
| feature | lead-inbox (순서 3, 규모 M) |
| 의존 | signal-briefing |

> 이 파일은 정본에서 `scripts/gen_feature_prds.mjs`로 생성한 파생본이다. 직접 편집하지 말고 정본을 고친 뒤 다시 생성한다.

## 0. Context

### Context Anchor

| 축 | 내용 |
|

### 역할

| 역할 | 정의 | 열람 범위 | 행동 차이 |
|---|---|---|---|
| 비로그인 | 로그인 전 방문자 | SCR-001만 | 로그인만 가능 |
| 일반 사용자 (KAM) | 핵심 고객 담당 영업. 수강생 실습 역할 | 담당 고객과 그 고객의 신호·리드·활동·점수·추천 | 리드 수락/거절, 미팅 노트 작성·확정, 추천 채택/보류/거절 |
| 관리자 (영업기획) | 강사 시연 역할 | 전체 고객 + 관리자 전용 화면(SCR-010, SCR-011) | 신호 수집·리드 변환 실행, 데이터 초기화, 별칭·중복 통합 승인, 리드 담당자 지정, 실험 실행 |

## 비목표 (정본 3.2 전체)

| ID | 이번에 만들지 않을 것 | 제외 이유 | 다시 검토할 시점 |
|---|---|---|---|
| NG-01 | 실제 기업 내부 데이터·사내 시스템(CRM·ERP) 연동 | 기밀 보호, 강의용 데모 범위 | 실제 파일럿 제안 시 |
| NG-02 | 공공 API(DART·식약처·NTIS) 실시간 호출 | API 키·네트워크 의존 제거. 같은 형식의 샘플 피드로 대체 | v1 착수 시 |
| NG-03 | 시뮬레이션 요구사항 S-1~S-5 | 이번 강의 모듈 범위 밖 | 다음 강의 모듈 기획 시 |
| NG-04 | 머신러닝 모델 학습(로지스틱 회귀 등) | 설명 가능한 규칙 점수가 강의 목적에 적합 | v1 |
| NG-05 | 회원가입·비밀번호 재설정·SSO | 시드 계정으로 충분 | 외부 공개 배포 시 |
| NG-06 | 클라우드 배포·다중 기기 공유 | localhost 실행이 요구사항 | 외부 공유 요구 발생 시 |
| NG-07 | 특정 실제 기업의 상표·로고·제품명 사용 | 실제 기업으로 오인 방지 | 재검토 없음 |
| NG-08 | 이메일·메신저 알림 발송 | 데모 범위 밖 | v1 |
| NG-09 | 다국어 지원 | 한국어 강의 | 해외 강의 요청 시 |

## 화면 계약

포함: SCR-003


### SCR-003 리드 인박스

- 유형: 목록·처리 · Route `/leads` · 대상: KAM(본인 배정 리드), 관리자(전체) · 목적: A-2 임상 승인·국가 과제 신호를 잠재 수요 리드로 검토
- 진입: NAV-02, SCR-002-EL-02 · 전이: 수락·거절 후 같은 화면
- 관련: US-02 · FR-016~FR-020 · SC-016~SC-019 · DATA-005, DATA-002
- 디자인 참고: REF-03(메일 인박스형 탭+표)
- 레이아웃: PageHeader → Tabs → DataTable(행 끝 행동 버튼). 모바일은 표를 카드 리스트로 변환

| 요소 ID | 종류 | 컴포넌트 | 라벨·표시값 | 노출 | 조건 | 데이터 | 입력·검증 | 행동·결과 |
|---|---|---|---|---|---|---|---|---|
| SCR-003-EL-01 | 탐색 | Tabs | 검토 대기 {n} / 수락 / 거절 | 로그인 | 항상 | DATA-005.status | — | 탭 전환 |
| SCR-003-EL-02 | 표시 | DataTable | 출처(식약처 임상/국가 과제) · 기관명 · 매칭 고객(자동/후보/신규 Badge) · 모달리티 · 단계 · 예산 규모 · 추천 제품군 · 신뢰도 | 로그인 | 항상 | DATA-005.* | — | — |
| SCR-003-EL-03 | 행동 | Button(primary) | 수락 | 로그인 | status=pending | — | 매칭 고객 확정 필요(후보면 EL-06 선택 필수) | FR-018 |
| SCR-003-EL-04 | 행동 | Button(secondary) | 거절 | 로그인 | status=pending | — | EL-05 필수 | FR-019 |
| SCR-003-EL-05 | 입력 | Select | 거절 사유: 중복 / 사업 범위 밖 / 정보 부족 | 로그인 | 거절 클릭 시 인라인 표시 | DATA-005.reject_reason | 필수 | — |
| SCR-003-EL-06 | 입력 | Select | 매칭 고객: {후보 고객들} / 신규 고객으로 등록 | 로그인 | match_status=candidate 또는 new | DATA-005.matched_account_id | 필수(수락 시) | — |
| SCR-003-EL-07 | 입력 | Select | 담당자: {KAM 목록} | 관리자 | 항상 | DATA-005.assignee_user_id | — | 저장 즉시 반영 FR-020 |
| SCR-003-EL-08 | 상태 | Toast | 리드를 수락했습니다 / 리드를 거절했습니다 | 로그인 | 처리 성공 | — | — | 3초 후 닫힘 |
| SCR-003-EL-09 | 상태 | EmptyState | 검토할 리드가 없습니다. | 로그인 | 탭 결과 0건 | — | — | — |
| SCR-003-EL-10 | 상태 | FieldError | 거절 사유를 선택하세요 / 매칭할 고객을 선택하세요 | 로그인 | 검증 실패 | — | — | — |

| 상태 | 표시 | 검증 SC |
|---|---|---|
| 초기 | 검토 대기 탭 | SC-017 |
| 로딩 | 표 Skeleton | SC-017 |
| 빈 | SCR-003-EL-09 | SC-018 |
| 성공 | Toast + 행이 다른 탭으로 이동 | SC-017, SC-018 |
| 검증 오류 | SCR-003-EL-10 | SC-018 |
| 시스템 오류 | ErrorBanner + 다시 시도 | SC-040 |
| 권한 없음 | 타 담당 리드는 목록에서 제외(서버 필터) | SC-019 |
| 오프라인 | 해당 없음 — localhost | — |

## Functional Requirements

| ID | 판정 가능한 요구사항 | 우선순위 | 시나리오 | 화면·요소 | 데이터 | 관련 SC | 검증 방법 |
|---|---|---|---|---|---|---|---|
| FR-016 | 리드 변환은 clinical·ntis 신호마다 리드 1건을 만든다. 기관명 유사도(11.8) ≥0.85 자동 매칭, 0.60~0.85 후보, <0.60 신규로 분류하고 모달리티→추천 제품군 규칙(11.7 표 B)을 적용한다. 담당자는 매칭 고객의 owner, 신규면 관리자 | P0 (High) | US-02 | SCR-011-EL-02, SCR-003-EL-02 | DATA-005 | SC-016 | [단위] 매칭 경계값 분기 |
| FR-017 | SCR-003은 상태 탭별 리드를 사용자 범위(KAM=본인 배정)로 표시한다 | P0 (High) | US-02 | SCR-003-EL-01, EL-02 | DATA-005 | SC-017 | [E2E] 탭 전환 |
| FR-018 | 수락 시 매칭 고객 확정(신규 선택이면 고객 생성, owner=수락자)·status=accepted·decided_by/at 기록 후 Toast | P0 (High) | US-02 | SCR-003-EL-03, EL-06, EL-08 | DATA-005, DATA-002 | SC-017 | [E2E] 수락 탭 이동 |
| FR-019 | 거절은 사유 선택이 필수이며 status=rejected와 사유를 저장한다 | P0 (High) | US-02 | SCR-003-EL-04, EL-05, EL-10 | DATA-005.reject_reason | SC-018 | [E2E] 사유 없으면 차단 |
| FR-020 | 관리자는 리드 담당자를 변경할 수 있고 KAM에게는 EL-07을 렌더링하지 않는다 | P1 (Medium) | US-02 | SCR-003-EL-07 | DATA-005.assignee_user_id | SC-019 | [E2E] 역할별 노출 |

### 비기능 요구사항 (공통)

| ID | 구분 | 요구사항 | 측정 방법 |
|---|---|---|---|
| NFR-01 | 성능 | 시드 데이터 기준 각 화면 서버 응답 p95 1초 이내(로컬). 실험 실행 10초 이내 | [통합] 응답 시간 로그 |
| NFR-02 | 보안 | 비밀번호는 scrypt 해시 저장, 세션 토큰은 해시로 저장, 모든 권한 검사는 서버에서 수행, API 키는 서버 환경 변수로만 사용하고 클라이언트로 보내지 않음 | [단위] 해시·권한 미들웨어 테스트 |
| NFR-03 | 접근성 | P0 화면 전부 axe 검사 serious·critical 위반 0건 | [E2E] @axe-core/playwright |
| NFR-04 | 실행 검증 | E2E는 프로덕션 빌드(`next build && next start`, 포트 3100), Chromium, 뷰포트 1440×900 기본 + 반응형 SC는 390×844, workers=1(SQLite 단일 파일) | [E2E] Playwright 설정 |
| NFR-05 | 테스트 식별자 | 요소 ID = `data-testid` 값. E2E 셀렉터는 `data-testid`만 사용 | [수동] 코드 리뷰 + [E2E] 셀렉터 규칙 |
| NFR-06 | 상태 유도 | 테스트 DB(`DATABASE_PATH=data/test.db`)를 매 테스트 파일 시작 시 시드로 재생성. AI는 `AI_MODE=mock`(결정적 응답)·`AI_MODE=fail`(강제 실패)·`AI_MODE=off`. 시스템 오류는 Playwright route 모킹으로 500 유도. 세션 만료는 테스트 전용 시계 오프셋 `TEST_NOW_OFFSET_MS` | [E2E] 상태 유도 동작 |
| NFR-07 | 반응형 | 390×844에서 가로 스크롤 없음, NAV-11로 메뉴 접근 | [E2E] SC-037 |
| NFR-08 | 용량 | SQLite 파일 50MB 이하, 시드 생성 5초 이내 | [통합] 파일 크기·시간 |
| NFR-09 | 오프라인 | 해당 없음 — localhost 단일 기기 실행. AI 외 외부 네트워크 호출 없음 | [수동] 네트워크 차단 상태 실행 확인 |

## Success Criteria

| ID | 판정 기준 | 관련 FR·화면 | 측정 방법 | 현재 PRD 데이터로 검증 가능 |
|---|---|---|---|---|
| SC-016 | 기관명 매칭이 유사도 0.85 이상은 auto, 0.60 이상 0.85 미만은 candidate, 0.60 미만은 new를 반환하고 승인 별칭은 1.0이다 | FR-016 | [단위] 경계값 | 예 |
| SC-017 | kam1이 검토 대기 리드를 수락하면 Toast가 보이고 해당 행이 수락 탭에 있다. 후보 리드는 매칭 고객 선택 전 수락이 차단된다 | FR-017, FR-018 · SCR-003 | [E2E] 수락 흐름 | 예 |
| SC-018 | 사유 없이 거절하면 SCR-003-EL-10이 보이고, 사유 선택 후 거절 탭으로 이동한다. 모두 처리하면 EL-09가 보인다 | FR-019 · SCR-003 | [E2E] 거절 흐름 | 예 |
| SC-019 | SCR-003-EL-07이 관리자에게만 보이고, 담당자 변경 후 새 담당 KAM의 인박스에 리드가 보인다 | FR-020 | [E2E] 역할 2개 | 예 |

## 오류·경계 처리

| 상황 | 발생 화면·요소 | 사용자 표시 문구 | 이후 동작 | 데이터·로그 |
|---|---|---|---|---|
| 리드 사유 누락 | SCR-003-EL-10 | 거절 사유를 선택하세요 | 제출 차단 | — |

## 데이터 계약

### DATA-005 lead

| 필드 | 타입 | 필수 | 기본값 | 검증·제약 | 읽기 | 쓰기 | 출처 |
|---|---|---|---|---|---|---|---|
| id | integer PK | 예 | 자동 | — | — | — | 시스템 |
| signal_id | integer FK | 예 | — | unique | 서버 | FR-016 | — |
| org_name | text | 예 | — | — | SCR-003-EL-02 | FR-016 | 피드 |
| matched_account_id | integer | 아니오 | null | account.id | SCR-003-EL-02/06 | FR-016, FR-018 | 계산·사람 |
| match_score / match_status | real / text | 예 | — | 0~1 / auto·candidate·new | SCR-003-EL-02 | FR-016 | 11.8 |
| modality / stage / budget_krw | text/text/integer | 아니오 | null | — | SCR-003-EL-02 | FR-016 | 피드 |
| recommended_products | text(JSON) | 예 | [] | 11.7 표 B | SCR-003-EL-02 | FR-016 | 규칙 |
| confidence | real | 예 | — | 0~1 = match_score×0.7 + 필드 완비율×0.3 | SCR-003-EL-02 | FR-016 | 계산 |
| status | text | 예 | pending | pending·accepted·rejected | SCR-003-EL-01 | FR-018, FR-019 | 사람 |
| reject_reason | text | 조건 | null | rejected면 필수 | SCR-003 | FR-019 | 사람 |
| assignee_user_id | integer FK | 예 | — | user.id | 권한 필터 | FR-016, FR-020 | 규칙·사람 |
| decided_by / decided_at | integer / text | 아니오 | null | — | — | FR-018, FR-019 | 시스템 |

## 디자인 기준

- 시각 시스템: `docs/DESIGN.md` [기본값] Apple 스타일 디자인 시스템(이 프로젝트용으로 작성. to-prd 기본 자산 `assets/apple-DESIGN.md`가 이 환경에 없어 같은 원칙으로 새로 작성)
- 폰트: **Pretendard** 단일(가변 폰트, CDN `cdn.jsdelivr.net/gh/orioncactus/pretendard`)
- 톤: 차분하고 정확한 업무 도구. 숫자는 탭 숫자(tabular-nums), 등급은 색+텍스트 병기
- 브랜드 표기: "Sensing CRM" 텍스트 로고만. 실제 기업 상표 미사용(NG-07)

### 9.1 토큰 요약 (DESIGN.md 발췌)

| 토큰 | 값 |
|---|---|
| 배경 / 표면 / 테두리 | #F5F5F7 / #FFFFFF / #D2D2D7 |
| 본문 / 보조 텍스트 | #1D1D1F / #6E6E73 |
| 강조(Primary) | #0071E3 |
| 위험 고/중/저 | #D70015 / #B25000 / #248A3D |
| 반경 | 카드 18px, 입력·버튼 10px |
| 간격 | 4px 단위(4·8·12·16·24·32·48) |
| 글자 | 제목 28/34 600, 섹션 20/28 600, 본문 15/22 400, 보조 13/18 |

### 9.2 컴포넌트 목록

AppShell, TopNav, SideNav, PageHeader, Button(primary/secondary/text/destructive), IconButton, TextField, PasswordField, SearchField, DateField, TextArea, Select, SegmentedControl, Tabs, Badge, Tag, Card, StatTile, ScoreBar, DataTable, Timeline, BarChart, LineChart, DiffField, Modal, Toast, ErrorBanner, FieldError, EmptyState, Skeleton

### 9.3 참고 레퍼런스

| ID | 참고 대상 | 참고할 점 | 따라 하지 않을 점 | 적용 화면 |
|---|---|---|---|---|
| REF-01 | Apple ID 로그인 화면 패턴 | 중앙 단일 카드, 최소 입력 | 다단계 인증 흐름 | SCR-001 |
| REF-02 | 뉴스 앱 카드 피드 패턴 | 출처·시각을 작게, 요약을 크게 | 이미지 썸네일 | SCR-002 |
| REF-03 | 메일 인박스 패턴 | 탭별 상태, 행 단위 빠른 처리 | 스와이프 제스처 | SCR-003, SCR-009 |
| REF-04 | 문서 비교(diff) 편집기 패턴 | AI 제안과 확정값 나란히 | 실시간 협업 커서 | SCR-004 |
| REF-05 | CRM 고객 상세(레코드 페이지) 패턴 | 상단 요약 타일 + 2단 카드 | 과도한 탭 중첩 | SCR-006 |
| REF-06 | 관측성 대시보드 패턴 | 지표 타일 + 이슈 목록 + 처리 대기열 | 실시간 자동 새로고침 | SCR-007, SCR-008 |
| REF-07 | A/B 테스트 결과 화면 패턴 | 조건별 열 비교, 핵심 차이 강조 | 통계 유의성 표기 | SCR-010 |

## 스택·시스템 가정·규칙

### 11.1 레벨·스택·테스트

- 레벨·스택: **Dynamic** — Next.js 15(App Router) + TypeScript + SQLite(`better-sqlite3`, 파일 `data/sensing.db`) + Recharts + `@anthropic-ai/sdk`. Node 22. `http://localhost:3000`
- 실행: `npm install` → `npm run setup`(DB 생성·시드) → `npm run dev`
- 테스트: 단위 **Vitest** `npm run test` · E2E **Playwright**(+ @axe-core/playwright) `npm run test:e2e` (프로덕션 빌드 후 포트 3100, `AI_MODE=mock`, `DATABASE_PATH=data/test.db`)

| 역할 | 테스트 계정 | 시드 방법 |
|---|---|---|
| 비로그인 | 해당 없음 | 쿠키 없음 |
| 일반 사용자(KAM) | `kam1@demo.local`(담당 고객 12), `kam2@demo.local`(담당 고객 12) | `npm run db:seed`, 비밀번호는 환경 변수 `SEED_PASSWORD` |
| 관리자 | `admin@demo.local`(담당 6 + 전체 열람) | 같음 |

### 11.2 시스템 가정

| # | 칸 | 상태 | 내용 |
|---|---|---|---|
| 1 | 데이터 저장 위치와 수명 | [확정] | 로컬 SQLite 파일. 데모 초기화 또는 파일 삭제 전까지 유지. 사용자 요청 "SQLite" |
| 2 | 로그인·열람·편집 주체와 권한 | [기본값] | 4.1 역할표. 시드 계정 3개 |
| 3 | 호스팅·배포 환경 | [확정] | localhost 전용. 사용자 요청 "localhost" |
| 4 | 시간대·로케일 | [기본값] | Asia/Seoul, ko-KR, 날짜 `YYYY년 M월 D일` |
| 5 | 통화·환율·기준일 | [기본값] | KRW, 억 원 단위 표시. 환율 미사용 |
| 6 | 지원 언어 | [기본값] | 한국어만(NG-09) |
| 7 | 콘텐츠 출처와 권한 | [확정] | 모든 고객·주문·활동·신호는 합성 데이터. 이미지 미사용. 실제 상표 미사용 |
| 8 | 외부 서비스 실패 시 동작 | [기본값] | 외부 서비스는 Claude API 하나. 10초 타임아웃 후 규칙 기반 대체(11.4) |
| 9 | 성능·용량·접근성 기준 | [기본값] | NFR-01·03·08 |
| 10 | 수치·외부 사실의 출처와 기준일 | [기본값] | 2장 배경 수치는 [조사·기준일] 표기, 부록 B. 앱 안 수치는 모두 합성 |

### 11.3 실행 환경 변수

`DATABASE_PATH`(기본 `data/sensing.db`) · `SEED_PASSWORD` · `AI_MODE`(`live`|`mock`|`fail`|`off`, 기본: 키 있으면 live, 없으면 mock) · `ANTHROPIC_API_KEY`(선택) · `AI_MODEL`(기본 `claude-sonnet-5-5`) · `TEST_NOW_OFFSET_MS`(테스트 전용). 값은 `.env.local`에 두고 저장소에는 `.env.example`(이름만)만 커밋한다.

### 11.4 AI 판정 계약

| ID | AI 기능 | 입력 | 출력 | 사람 확정 주체·화면 | 되돌리기 | AI 실패 시 동작 |
|---|---|---|---|---|---|---|
| AI-1 | 미팅 메모 구조화(A-5) | 메모 원문, 고객명, 제품군 목록 | JSON 7필드(needs, products[], competitors[], complaints, next_step, next_contact_date, sentiment) + confidence 0~1 | KAM이 SCR-004에서 필드별 확인·수정 후 "확정 저장" | 확정 후 24시간 이내 "확정 취소"(FR-024). AI 원값(ai_*)은 별도 필드로 보존 | 규칙 기반 추출기: 제품군·경쟁사 사전 키워드 매칭, 날짜 정규식, 부정어 사전으로 sentiment, 첫 문장=needs, "다음/예정/검토" 포함 문장=next_step. EL-11 표시 |
| AI-2 | 신호 요약(A-1) | 신호 제목·본문 | 3줄 요약(각 60자 이내) | 확정 없음 — 읽기 전용 참고 정보이며 "AI 요약" 라벨과 원문 링크를 항상 함께 표시 | 해당 없음 — 원문 불변 | 원문 앞 120자, summary_method=rule |
| AI-3 | 추천 근거 설명(O-2) | 규칙 엔진이 만든 추천 + 근거 신호 | 1~2문장 설명 | KAM이 SCR-009에서 채택/보류/거절 | 보류·거절 후 다시 채택 가능 | 템플릿 "{근거 신호 요약} 때문에 {기한}까지 {채널}로 {행동}을 권합니다." |

- 판정 원칙: AI 출력은 **제안값**이며 품질 지표의 정확성·검증(verified)은 사람 확정값으로만 계산한다. 추천과 이탈 점수 자체는 결정적 규칙이며 AI는 문장만 만든다.
- `AI_MODE=mock`은 메모 해시 기반의 결정적 고정 응답을 돌려준다(테스트·키 없는 시연용).

### 11.5 데이터 품질 지표 정의

범위(전체/사용자/고객) 안의 레코드로 계산하며 0~1(화면은 %).

| 지표 | 계산식 |
|---|---|
| 완전성 | 확정·초안 활동의 필수 필드(needs, next_step, sentiment, competitors 확인 여부, next_contact_date) 채움 수 ÷ 필수 필드 총수 |
| 정확성 | 활동 중 verified=1(사람 확정 또는 시드 기준값 일치) 비율 |
| 적시성 | recorded_at − meeting_date ≤ 2일인 활동 비율 |
| 일관성 | account_id가 해소된 신호·리드 수 ÷ 신호·리드 총수 |
| 유일성 | 1 − (open 상태 duplicate_account 이슈 대상 고객 수 ÷ 고객 수) |
| 종합 | 5개 지표 산술 평균 |

### 11.6 이탈위험 점수 규칙 (P-2)

기준일 = 오늘. 각 요인은 0~1로 정규화 후 가중치를 곱해 합산(0~100, 반올림).

| 요인 | 원값 | 정규화 | 가중치 |
|---|---|---|---|
| 주문 감소 | (직전 3개월 주문액 − 최근 3개월) ÷ 직전 3개월 | min(max(값,0)/0.5, 1) | 35 |
| 접촉 공백 | 마지막 확정 활동 이후 경과일 | min(일수/90, 1) | 20 |
| 경쟁사 언급 | 최근 90일 확정 활동의 competitors 언급 수 | min(수/3, 1) | 20 |
| 불만·부정 | 최근 90일 complaints 존재 또는 sentiment=부정 활동 수 | min(수/2, 1) | 15 |
| 위협 신호 | 최근 90일 경쟁사 평가·국산화 유형 신호 수 | min(수/2, 1) | 10 |

등급: 고 ≥ 60, 중 35~59, 저 < 35. 근거 = 기여 점수 상위 3개(0 제외).

### 11.7 다음 행동 추천 규칙 (O-2)

표 A — 조건 → 행동 (우선순위 높은 순, 고객당 상위 3건)

| 우선 | 조건 | 행동 | 제품군 | 채널 | 기한 |
|---|---|---|---|---|---|
| 1 | 이탈위험 등급 고 | 경영진 리뷰 미팅·장기 공급계약 제안 | 주력 구매 제품군 | 방문 | 3일 |
| 2 | 최근 90일 경쟁사 언급 | 비교 기술자료 전달·기술 세미나 초청 | 언급된 제품군 | 이메일 | 7일 |
| 3 | 최근 30일 증설·수주 신호 | 증설 라인 소모품 공급 제안 | 세포배양 배지·일회용 백 | 방문 | 7일 |
| 4 | 다음 접촉 예정일이 7일 이내 | 예정 후속 연락 | 직전 활동 제품군 | 전화 | 예정일 |
| 5 | 수락된 임상 리드(최근 60일) | 공정개발 지원 제안 | 표 B 추천 제품군 | 이메일+방문 | 14일 |
| 6 | 수락된 국가 과제 리드(최근 60일) | 장비 데모 제안 | 표 B 추천 제품군 | 방문 | 30일 |

표 B — 모달리티 → 추천 제품군: 항체 → 세포배양 배지·크로마토그래피 레진 / 세포·유전자치료 → 세포치료 배지·자동화 세포처리 장비 / mRNA·핵산 → 효소·정제 시약 / 백신 → 일회용 바이오리액터 백 / 저분자 → 질량분석기 / 소재·배터리 → 전자현미경·분광 분석기 / 기타 → 실험실 소모품

### 11.8 기관명 매칭

정규화(공백·괄호·법인 표기 "(주)", "주식회사", "Co., Ltd." 제거, 소문자, 한글 자모 분해 없이 음절 비교) 후 승인 별칭과 정확 일치하면 1.0, 아니면 고객명·별칭과 Jaro-Winkler 최댓값을 유사도로 쓴다.

### 11.9 실험 열화 규칙

자동화 비율 r에서 각 열화 확률 p = 수기값 × (1 − r) + 자동값 × r. 난수 시드 42 고정.

| 열화 | 수기값(r=0) | 자동값(r=1) |
|---|---|---|
| 필수 필드 누락 | 0.35 | 0.05 |
| 경쟁사 언급 누락 | 0.50 | 0.05 |
| 기록 지연(>2일) | 0.40 | 0.05 |
| 고객명 미해소 | 0.30 | 0.05 |
| 중복 고객 생성 | 0.10 | 0.01 |
| 확정 검토 누락(verified=0) | 0.60 | 0.10 |

재현율 = 고등급 중 정답 이탈 수 ÷ 정답 이탈 6. 정밀도 = 고등급 중 정답 이탈 수 ÷ 고등급 수(0이면 0). 추천 적중률 = 정답 "다음 필요 행동"이 상위 3 추천에 포함된 고객 비율.

## 완료 조건

- 계약 버전: [검증 기준] 이 환경에 bkit 설치본과 to-prd `references/bkit-contract.md`가 없어 확인하지 못했다. 설치 후 `bkit.config.json`과 로컬 템플릿이 다르면 로컬을 우선하고 부록 B에 기록한다.
- 설정: `matchRateThreshold` 90 [검증 기준]
- 명령 순서(feature마다, 14장 순서): `/pdca plan {feature}` → `/pdca design {feature}` → `/pdca do {feature}` → `/pdca analyze {feature}` → (미달 시 `/pdca iterate {feature}`) → `/pdca report {feature}`
- 이 feature 첫 명령: `/pdca plan lead-inbox`
- 완료 조건(두 관문):
  1. gap 분석 match rate 90% 이상
  2. Check 단계에서 `npm run test`와 `npm run test:e2e`를 **실제로 실행**해 해당 feature SC가 모두 통과하고, 결과를 analysis 문서에 기록
- gap-detector는 설계와 코드를 비교할 뿐 테스트를 실행하지 않으므로 match rate만으로 완료를 판정하지 않는다.

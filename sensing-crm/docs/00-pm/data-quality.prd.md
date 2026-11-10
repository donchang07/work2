# data-quality — Feature PRD (Sensing CRM)

| 항목 | 값 |
|---|---|
| 정본 | `docs/PRD.md` |
| 정본 개정 | v1.2 |
| PRD 스키마 | screen-first-v2 |
| feature | data-quality (순서 5, 규모 M) |
| 의존 | meeting-note, signal-briefing |

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

포함: SCR-007


### SCR-007 데이터 품질

- 유형: 대시보드 · Route `/quality` (`?account={id}` 선택) · 대상: KAM(담당 범위 조회), 관리자(전체·통합 처리) · 목적: 품질 5개 지표와 이슈, 고객명 통합
- 진입: NAV-07, SCR-006-EL-07 · 전이: 같은 화면
- 관련: US-03 · FR-027~FR-031 · SC-025~SC-027 · DATA-010, DATA-011, DATA-003
- 디자인 참고: REF-06(지표 타일 + 처리 대기열)
- 레이아웃: StatTile 6개(종합 강조) → 추세 차트 → 좌 이슈 표 / 우 통합 대기열. 모바일 1단

| 요소 ID | 종류 | 컴포넌트 | 라벨·표시값 | 노출 | 조건 | 데이터 | 입력·검증 | 행동·결과 |
|---|---|---|---|---|---|---|---|---|
| SCR-007-EL-01 | 표시 | StatTile ×6 | 종합 · 완전성 · 정확성 · 적시성 · 일관성 · 유일성 (%) — 각 타일에 ⓘ 정의 툴팁 | 로그인 | 항상 | DATA-011 최신 | — | — |
| SCR-007-EL-02 | 표시 | LineChart | 최근 8개 스냅샷 추세. 고객 범위(`?account=`)로 열면 그 고객의 추세와 제목 「{고객명} 품질 추세」 | 로그인 | 스냅샷 2개 이상 | DATA-011 | — | — |
| SCR-007-EL-03 | 입력 | Select | 이슈 유형: 전체/필수 항목 누락/기록 지연/고객명 미해소/중복 고객 | 로그인 | 항상 | DATA-010.issue_type | — | 필터 |
| SCR-007-EL-04 | 표시 | DataTable | 유형 · 대상 · 설명 · 상태 | 로그인 | 항상 | DATA-010 | — | 대상 클릭 → 해당 화면 |
| SCR-007-EL-05 | 표시 | Card list | 통합 대기열: "{원문 이름}" ↔ {후보 고객} · 유사도 {0.xx} | 로그인 | 후보 1건 이상 | DATA-010(unresolved_name, duplicate_account) | — | — |
| SCR-007-EL-06 | 행동 | Button(primary) | 같은 고객으로 통합 | 관리자 | 대기 항목 | — | — | FR-030 |
| SCR-007-EL-07 | 행동 | Button(secondary) | 다른 고객 | 관리자 | 대기 항목 | — | — | 이슈 dismissed |
| SCR-007-EL-08 | 행동 | Button(text) | 지표 재계산 | 로그인 | 항상 | — | — | FR-027·FR-028 |
| SCR-007-EL-09 | 상태 | EmptyState | 처리할 통합 후보가 없습니다. | 로그인 | 대기 0건 | — | — | — |

| 상태 | 표시 | 검증 SC |
|---|---|---|
| 초기 | 타일·차트·표·대기열 | SC-026 |
| 로딩 | Skeleton | SC-026 |
| 빈 | EL-09, 이슈 0건 "열린 이슈가 없습니다." | SC-026 |
| 성공 | 통합 후 Toast "통합했습니다", 지표 갱신 | SC-026 |
| 검증 오류 | 해당 없음 — 선택형 | — |
| 시스템 오류 | ErrorBanner + 다시 시도 | SC-040 |
| 권한 없음 | KAM: EL-06·EL-07 미노출, 담당 범위만 | SC-027 |
| 오프라인 | 해당 없음 — localhost | — |

## Functional Requirements

| ID | 판정 가능한 요구사항 | 우선순위 | 시나리오 | 화면·요소 | 데이터 | 관련 SC | 검증 방법 |
|---|---|---|---|---|---|---|---|
| FR-027 | 품질 5개 지표와 종합 점수를 11.5 정의로 범위(전체/사용자/고객)별 계산한다 | P0 (High) | US-03 | SCR-007-EL-01, SCR-006-EL-07 | DATA-011 | SC-025 | [단위] 고정 픽스처 기대값 |
| FR-028 | 재계산·통합·확정 저장·수집 후 스냅샷(전체·KAM별·고객별)을 저장하고 최근 8개를 화면 범위에 맞는 추세로 표시한다 | P1 (Medium) | US-03 | SCR-007-EL-02, EL-08 | DATA-011 | SC-026 | [E2E] 통합 후 스냅샷 증가 |
| FR-029 | 품질 이슈를 유형 필터와 함께 목록으로 표시한다 | P0 (High) | US-03 | SCR-007-EL-03, EL-04 | DATA-010 | SC-026 | [E2E] 필터 |
| FR-030 | 관리자가 통합 승인하면 unresolved_name은 원문 이름을 대상 고객의 별칭(approved)으로 등록하고 같은 원문의 신호·리드를 재해소한다. duplicate_account는 보조 고객의 하위 데이터를 주 고객으로 이전하고 보조 고객을 merged 처리한다. 이후 지표를 재계산한다 | P0 (High) | US-03 | SCR-007-EL-05, EL-06, EL-07 | DATA-003, DATA-010, DATA-002 | SC-026 | [E2E] 대기열 감소·일관성 상승 |
| FR-031 | KAM에게는 담당 범위 지표·이슈만 표시하고 EL-06·EL-07을 렌더링하지 않으며 통합 API는 403 | P0 (High) | US-03 | SCR-007-EL-06, EL-07 | DATA-010 | SC-027 | [E2E] 버튼 미노출 |

### 비기능 요구사항 (공통)

| ID | 구분 | 요구사항 | 측정 방법 |
|---|---|---|---|
| NFR-01 | 성능 | 시드 데이터 기준 각 화면 서버 응답 p95 1초 이내(로컬). 실험 실행 10초 이내 | [통합] 응답 시간 로그 |
| NFR-02 | 보안 | 비밀번호는 scrypt 해시 저장, 세션 토큰은 해시로 저장, 모든 권한 검사는 서버에서 수행, API 키는 서버 환경 변수로만 사용하고 클라이언트로 보내지 않음 | [단위] 해시·권한 미들웨어 테스트 |
| NFR-03 | 접근성 | P0 화면 전부 axe 검사 serious·critical 위반 0건 | [E2E] @axe-core/playwright |
| NFR-04 | 실행 검증 | E2E는 프로덕션 빌드(`next build && next start`, 포트 3100), Chromium, 뷰포트 1440×900 기본 + 반응형 SC는 390×844, workers=1(SQLite 단일 파일) | [E2E] Playwright 설정 |
| NFR-05 | 테스트 식별자 | 요소 ID = `data-testid` 값. E2E 셀렉터는 `data-testid`만 사용 | [수동] 코드 리뷰 + [E2E] 셀렉터 규칙 |
| NFR-06 | 상태 유도 | 테스트 서버는 `E2E=1`로 기동하고, `E2E=1`일 때만 열리는 테스트 전용 API(`POST /api/test/reset {variant}`: 시드 재생성·변형 `default`/`empty-today`, `POST /api/test/config {aiMode, nowOffsetMs}`: AI 모드·시계 오프셋)로 상태를 유도한다. AI 모드는 `mock`(결정적 응답)·`fail`(강제 실패)·`off`. 시스템 오류는 Playwright route 모킹으로 500 유도. 세션 만료는 시계 오프셋으로 유도 | [E2E] 상태 유도 동작 |
| NFR-07 | 반응형 | 390×844에서 가로 스크롤 없음, NAV-11로 메뉴 접근 | [E2E] SC-037 |
| NFR-08 | 용량 | SQLite 파일 50MB 이하, 시드 생성 5초 이내 | [통합] 파일 크기·시간 |
| NFR-09 | 오프라인 | 해당 없음 — localhost 단일 기기 실행. AI 외 외부 네트워크 호출 없음 | [수동] 네트워크 차단 상태 실행 확인 |

## Success Criteria

| ID | 판정 기준 | 관련 FR·화면 | 측정 방법 | 현재 PRD 데이터로 검증 가능 |
|---|---|---|---|---|
| SC-025 | 고정 픽스처(활동 10건: 누락 2·지연 3·미해소 1·중복 1)에 대해 5개 지표와 종합이 11.5 계산식의 기대값과 소수 셋째 자리까지 같다 | FR-027 | [단위] 지표 함수 | 예 |
| SC-026 | 관리자가 통합 후보 1건을 승인하면 대기열이 1 줄고 일관성 지표가 승인 전보다 높으며 스냅샷 추세 점이 1개 늘어난다 | FR-028~FR-030 · SCR-007 | [E2E] 통합 승인 | 예 |
| SC-027 | KAM의 SCR-007에 EL-06·EL-07이 없고 통합 API 호출이 403이다 | FR-031 · SCR-007 | [E2E] 역할 차이 | 예 |

## 오류·경계 처리

| 상황 | 발생 화면·요소 | 사용자 표시 문구 | 이후 동작 | 데이터·로그 |
|---|---|---|---|---|
| 기관명 미해소 | SCR-007-EL-05 | "{원문}" ↔ {후보} | 관리자 통합 대기 | DATA-010 |

## 데이터 계약

### DATA-010 dq_issue

| 필드 | 타입 | 필수 | 기본값 | 검증·제약 | 읽기 | 쓰기 | 출처 |
|---|---|---|---|---|---|---|---|
| id | integer PK | 예 | 자동 | — | — | — | 시스템 |
| issue_type | text | 예 | — | missing_field·late_entry·unresolved_name·duplicate_account | SCR-007-EL-03/04 | FR-013, FR-027 | 계산 |
| entity / entity_id | text / integer | 예 | — | — | SCR-007-EL-04 | 같음 | 계산 |
| description | text | 예 | — | — | SCR-007-EL-04/05 | 같음 | 계산 |
| candidate_account_id / similarity | integer / real | 아니오 | null | 통합 유형만 | SCR-007-EL-05 | 같음 | 11.8 |
| status | text | 예 | open | open·resolved·dismissed | SCR-007 | FR-030 | 사람 |
| resolved_by / resolved_at | integer / text | 아니오 | null | — | — | FR-030 | 시스템 |

### DATA-011 dq_snapshot

| 필드 | 타입 | 필수 | 기본값 | 검증·제약 | 읽기 | 쓰기 | 출처 |
|---|---|---|---|---|---|---|---|
| id | integer PK | 예 | 자동 | — | — | — | 시스템 |
| scope | text | 예 | all | all·user:{id} | SCR-007 | FR-028 | 시스템 |
| completeness, accuracy, timeliness, consistency, uniqueness, overall | real | 예 | — | 0~1 | SCR-007-EL-01/02, SCR-005-EL-03 | FR-027, FR-028 | 11.5 |
| computed_at | text(ISO) | 예 | 현재 | — | SCR-007-EL-02 | FR-028 | 시스템 |

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

`DATABASE_PATH`(기본 `data/sensing.db`) · `SEED_PASSWORD` · `AI_MODE`(`live`|`mock`|`fail`|`off`, 기본: 키 있으면 live, 없으면 mock) · `ANTHROPIC_API_KEY`(선택) · `AI_MODEL`(기본 `claude-sonnet-5-5`) · `E2E`(테스트 서버 전용, 테스트 API 활성화). 값은 `.env.local`에 두고 저장소에는 `.env.example`(이름만)만 커밋한다.

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

- 계약 버전: [확정] 작성·구현 환경에 bkit이 설치되어 있지 않다. 같은 PDCA 절차와 bkit 산출물 경로(`docs/01-plan/features/{feature}.plan.md`, `docs/02-design/features/{feature}.design.md`, `docs/03-analysis/{feature}.analysis.md`, `docs/04-report/features/{feature}.report.md`)로 수동 수행한다. gap 분석은 `npm run gap -- {feature}`(설계 항목 대비 구현 일치율)로 계산한다. bkit 설치 후에는 로컬 계약을 우선한다.
- 설정: `matchRateThreshold` **95** [확정] — 사용자 지시(2026-11-09)
- 명령 순서(feature마다, 14장 순서): `/pdca plan {feature}` → `/pdca design {feature}` → `/pdca do {feature}` → `/pdca analyze {feature}` → (미달 시 `/pdca iterate {feature}`) → `/pdca report {feature}`
- 이 feature 첫 명령: `/pdca plan data-quality`
- 완료 조건(두 관문):
  1. gap 분석 match rate 95% 이상
  2. Check 단계에서 `npm run test`와 `npm run test:e2e`를 **실제로 실행**해 해당 feature SC가 모두 통과하고, 결과를 analysis 문서에 기록
- gap-detector는 설계와 코드를 비교할 뿐 테스트를 실행하지 않으므로 match rate만으로 완료를 판정하지 않는다.

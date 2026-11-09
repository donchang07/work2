# Plan — foundation-auth

| 항목 | 값 |
|---|---|
| feature | foundation-auth (PDCA 1/9) |
| 기준 | `docs/00-pm/foundation-auth.prd.md` (정본 v1.1) |
| 범위 | SCR-001 로그인, SCR-012 접근 거부, NAV-01~NAV-12(AppShell), DATA-001·002·003·007·013, 전체 스키마·결정적 시드 |
| FR / SC | FR-001~FR-008 / SC-001~SC-010, SC-037, SC-040 |

## 목표
1. 모든 후속 feature가 쓰는 **스키마 전체(DATA-001~014)와 결정적 시드**를 만든다(시드 42, 고객 30, 정답 이탈 6).
2. 이메일·비밀번호 로그인, 8시간 세션, 만료·로그아웃·권한 거부를 서버에서 판정한다.
3. 역할별 메뉴(NAV)와 반응형 AppShell을 제공한다.

## 작업 순서
1. Next.js 15 + TypeScript 뼈대, DESIGN.md 토큰 CSS, Pretendard
2. `lib/db.ts` 스키마, `lib/domain/generate.ts` 정답·열화 데이터 생성, `scripts/seed.ts`
3. `lib/auth.ts`(scrypt·세션), 로그인·로그아웃 API, 페이지 가드
4. AppShell·NAV, SCR-001, SCR-012, 각 화면 경로의 자리 표시 페이지
5. 테스트 전용 API(NFR-06), Vitest·Playwright 설정, SC 테스트

## 위험
- 시드가 날짜(오늘)에 의존 → 같은 날짜 기준으로 결정적임을 SC-010에서 확인
- 후속 화면이 아직 없음 → 경로는 존재하되 "준비 중" EmptyState로 둔다(후속 feature에서 교체)

## 완료 조건
match rate 95% 이상 + `npm run test`·`npm run test:e2e` 해당 SC 전체 통과

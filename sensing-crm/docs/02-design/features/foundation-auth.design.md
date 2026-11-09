# Design — foundation-auth (공통 아키텍처 포함)

## 1. 아키텍처

```
app/
  layout.tsx                 Pretendard·globals.css
  login/page.tsx             SCR-001 (client form)
  (app)/layout.tsx           서버 가드(requirePageUser) + AppShell
  (app)/briefing|leads|notes|accounts|accounts/[id]|quality|risk|actions/page.tsx
  (app)/lab, (app)/admin/ops  관리자 가드
  forbidden/page.tsx         SCR-012
  api/**/route.ts            JSON API (클라이언트 fetch → Playwright route 모킹 가능)
lib/
  db.ts      better-sqlite3 싱글턴, 스키마 DDL, 재연결
  time.ts    now()(시계 오프셋), Asia/Seoul 날짜
  rng.ts     mulberry32
  auth.ts    scrypt, 세션(SHA-256 토큰 해시), 가드
  domain/    generate·names·quality·risk·nba·extract·lab (순수 함수, DB 무관)
  repo.ts    DB ↔ 도메인 배열 로딩, 범위(scope) 필터
  seed.ts    seedDatabase(variant)
components/ui.tsx           9.2 컴포넌트 목록 구현
components/AppShell.tsx     TopNav·SideNav·NAV-01~12
```

- 화면 데이터는 **클라이언트 컴포넌트가 `/api/*`를 fetch**한다(NFR-06 route 모킹으로 시스템 오류 유도). 페이지 진입 권한은 서버 레이아웃에서 판정한다.
- API는 401(세션 없음/만료) → 클라이언트가 `/login?reason=expired`로 이동, 403 → `/forbidden`.

## 2. 인증

| 항목 | 설계 |
|---|---|
| 해시 | `scrypt(password, salt, 32)`, 저장 `salt:hash` (hex) |
| 세션 | 32바이트 랜덤 토큰 → 쿠키 `sc_session`(httpOnly, SameSite=Lax, path=/), DB엔 SHA-256 |
| 유효 | 생성 + 8h. 판정은 `now()`(테스트 시계 오프셋 반영) |
| 쿠키 없음 | 페이지: `/login?next={path}` |
| 쿠키 있음·세션 없음/만료 | 페이지: `/login?reason=expired`, API: 401 `{error:'expired'}` |
| 관리자 경로 | `/lab`, `/admin/*`, 관리자 API → KAM은 `/forbidden` / 403 |

## 3. 데이터 생성 (시드·실험 공용)

`generateTruth(seed)` → 정답 세계: 사용자 3, 고객 30(kam1 12·kam2 12·admin 6, 담당자별 이탈 2), 12개월 주문, 고객당 4~5 활동(180일), 신호(90일·오늘), 임상·과제 피드, 별칭.
`degrade(truth, r, seed)` → 열화 확률 p = 수기×(1−r)+자동×r (11.9). **공통 난수**(항목별 고정 u)로 r이 커지면 열화 집합이 줄어드는 단조성을 보장한다.
운영 DB 시드는 r = 0.5 데이터셋.

이탈 고객 정답 특성: 주문 −30%, 마지막 접촉 40일, 경쟁사 언급 3, 불만 2, 위협 신호 2 → 정답 점수 ≈ 75. 비이탈: 주문 유지·증가, 최근 접촉, 언급 0~1.

## 4. 시드 변형 (테스트 API)
- `default`: 위 데이터 + 오늘자 신호 일부 수집 상태 + 미수집 피드
- `empty-today`: 오늘자 신호 미수집(브리핑 빈 상태)

## 5. UI
- AppShell: TopNav(NAV-11 햄버거, NAV-12 데모 Badge, NAV-10 사용자 메뉴) + SideNav(NAV-01~09, 관리자 구분선)
- `data-testid` = PRD 요소 ID. 반복 요소는 같은 testid를 공유. 공통 시스템 오류 배너는 `{SCR}-ERROR`.
- 스타일은 `app/globals.css` 전역 클래스(DESIGN.md 토큰). PRD 12장 I-05 기본값(CSS Modules)과 다르게 전역 CSS를 쓴다 — 화면 수가 적고 컴포넌트가 한 파일에 모여 있어 관리가 쉬움.

## 6. 테스트 매핑
| SC | 파일 |
|---|---|
| SC-001~009, SC-037, SC-040(로그인) | `tests/e2e/foundation-auth.spec.ts` |
| SC-010 | `tests/unit/seed.test.ts` |

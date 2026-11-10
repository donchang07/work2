# DESIGN.md — Sensing CRM 디자인 시스템

> [기본값] Apple 스타일 디자인 시스템. to-prd 기본 자산(`assets/apple-DESIGN.md`)이 작성 환경에 없어 같은 원칙(절제된 색, 넓은 여백, 명확한 위계, Pretendard)으로 이 프로젝트용으로 작성했다. PRD 9장이 이 파일을 참조한다.

## 1. 원칙

1. **내용이 주인공이다.** 장식보다 숫자·문장·상태가 먼저 보인다.
2. **위계는 크기·굵기·여백으로 만든다.** 색은 상태와 행동에만 쓴다.
3. **한 화면, 한 주요 행동.** primary 버튼은 화면(또는 카드)마다 하나.
4. **색만으로 의미를 전달하지 않는다.** 위험 등급·상태는 항상 텍스트를 병기한다.
5. **교육용 데모임을 항상 드러낸다.** 상단 "교육용 데모 · 합성 데이터" Badge 고정.

## 2. 폰트

- **Pretendard** 단일 사용(가변 폰트).
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  ```
- `font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;`
- 숫자 열·지표: `font-variant-numeric: tabular-nums;`

| 토큰 | 크기/행간 | 굵기 | 용도 |
|---|---|---|---|
| `--type-title` | 28/34 | 600 | PageHeader |
| `--type-section` | 20/28 | 600 | 카드 제목 |
| `--type-stat` | 32/38 | 600 | StatTile 값 |
| `--type-body` | 15/22 | 400 | 본문 |
| `--type-caption` | 13/18 | 400 | 보조, 표 머리 |

## 3. 색

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `--bg` | #F5F5F7 | #000000 | 페이지 배경 |
| `--surface` | #FFFFFF | #1C1C1E | 카드·표 |
| `--border` | #D2D2D7 | #38383A | 구분선 |
| `--text` | #1D1D1F | #F5F5F7 | 본문 |
| `--text-2` | #6E6E73 | #A1A1A6 | 보조 |
| `--primary` | #0071E3 | #0A84FF | 주요 행동·링크·포커스 |
| `--primary-strong` | #0058B0 | #64B0FF | 옅은 강조 배경 위 텍스트(대비 4.5:1 확보) |
| `--risk-high` | #C00012 | #FF453A | 위험 고, destructive |
| `--risk-mid` | #8F4000 | #FF9F0A | 위험 중, warning |
| `--risk-low` | #1D7533 | #30D158 | 위험 저, success |
| `--ai` | #6E3CBC | #BF5AF2 | AI 제안 표시(Badge, DiffField 제안값) |

대비는 본문 4.5:1 이상을 유지한다.

## 4. 간격·모양·그림자

- 간격: 4px 단위 — 4 · 8 · 12 · 16 · 24 · 32 · 48
- 페이지 여백: 데스크톱 32px, 모바일 16px. 본문 최대 폭 1200px
- 반경: 카드 18px, 입력·버튼 10px, Badge 999px
- 그림자: 카드 `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04)`. Modal만 더 진하게
- 모션: 150–200ms ease-out. `prefers-reduced-motion` 존중

## 5. 레이아웃

- **AppShell**: TopNav(높이 56) + SideNav(폭 232) + 본문. 768px 미만에서 SideNav 숨김 → TopNav 햄버거로 시트 메뉴
- 그리드: 12열, 거터 24px. StatTile은 데스크톱 3~6개 가로, 모바일 세로 스택
- 2단 화면: 좌 7 / 우 5. 모바일 1단

## 6. 컴포넌트 (PRD 9.2 목록과 동일한 이름)

| 컴포넌트 | 규칙 |
|---|---|
| AppShell / TopNav / SideNav | 활성 메뉴는 primary 색 텍스트 + 옅은 배경. 관리자 메뉴는 구분선 아래 "관리자" 캡션 |
| PageHeader | 제목(type-title) + 보조 설명 + 우측 행동 1~2개 |
| Button | primary(채움), secondary(테두리), text(텍스트만), destructive(빨강 채움). 높이 40, 로딩 시 스피너+비활성 |
| IconButton | 40×40, aria-label 필수 |
| TextField / PasswordField / SearchField / DateField / TextArea / Select | 위 라벨, 아래 FieldError. 높이 40, 포커스 링 2px primary |
| SegmentedControl / Tabs | 선택 항목 흰 배경 + 그림자 / 하단 2px 표시선, 개수 Badge |
| Badge / Tag | Badge=상태(색+텍스트), Tag=분류(회색 테두리) |
| Card | surface, 반경 18, 패딩 24(모바일 16) |
| StatTile | 라벨(caption) → 값(type-stat) → 보조(증감, 색+기호 ▲▼) |
| ScoreBar | 0~100 막대 + 숫자. 구간 색 = risk 토큰 |
| DataTable | 행 높이 48, 머리 caption 굵게, 숫자 우측 정렬, 행 hover. 모바일은 카드 리스트로 변환 |
| Timeline | 날짜 그룹 + 유형 아이콘(신호/활동) + 한 줄 요약 |
| BarChart / LineChart | Recharts. 축·격자 옅게, 계열 색은 primary → ai → risk-mid 순서 |
| DiffField | 상단에 "AI 제안"(ai 색 caption) 값, 아래 편집 입력. 값이 다르면 "수정됨" Tag |
| Modal | 폭 480, 제목·본문·행동(우측 정렬: 보조 → 주요) |
| Toast | 하단 중앙, 3초 |
| ErrorBanner | 본문 상단 전폭. error/warning/info 변형, "다시 시도" 행동 선택 |
| FieldError | 입력 아래 13px risk-high 텍스트, aria-describedby 연결 |
| EmptyState | 아이콘 + 한 줄 설명 + 선택 행동 |
| Skeleton | 실제 레이아웃과 같은 크기의 회색 블록, 펄스 애니메이션 |

## 7. 문구

- 존댓말, 짧은 문장. 버튼은 동사형("수락", "확정 저장").
- 숫자: 금액은 억 원 소수 1자리, 비율은 % 정수, 점수는 정수.
- AI 생성 내용에는 항상 출처 라벨("AI 요약", "추출: Claude", "설명: AI")을 붙인다.

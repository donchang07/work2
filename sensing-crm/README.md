# Sensing CRM — 제약·바이오 마켓 센싱 CRM (강의용 데모)

자동화(A-1 신호 브리핑·A-2 리드 변환·A-5 미팅 노트 구조화)가 CRM 데이터 품질을 높이고, 그 품질이 이탈위험 예측(P-2)과 다음 행동 추천(O-2)의 성과를 좌우한다는 것을 시연하는 로컬 웹앱입니다. **모든 데이터는 합성·가상 데이터**입니다.

## 실행

```bash
npm install
npm run setup        # data/sensing.db 생성·시드 (오늘 날짜 기준)
npm run dev          # http://localhost:3000
```

| 역할 | 계정 | 비밀번호 |
|---|---|---|
| KAM | kam1@demo.local, kam2@demo.local | `.env.local`의 `SEED_PASSWORD` (기본 demo1234) |
| 관리자(강사) | admin@demo.local | 같음 |

- AI: `ANTHROPIC_API_KEY`가 있으면 Claude로 구조화·요약·설명(`AI_MODEL` 기본 `claude-sonnet-5-5`), 없으면 결정적 모의 응답. `AI_MODE=off`면 규칙 기반.
- 시연 순서(약 20분): 관리자 로그인 → 데이터 운영(신호 수집·리드 변환) → 브리핑 → 리드 인박스 → 미팅 노트 → 데이터 품질(통합 승인) → 위험 고객 → 다음 행동 → **품질-성과 실험실**

## 테스트

```bash
npm run test         # 단위 (Vitest)
npm run test:e2e     # E2E (Playwright, 프로덕션 빌드·포트 3100)
npm run gap -- <feature>
```

## 문서
- 요구사항 정본 `docs/PRD.md` (v1.1), 읽기용 `docs/PRD.html`
- PDCA: `docs/01-plan`, `docs/02-design`, `docs/03-analysis`, `docs/04-report` (요약: `docs/04-report/sensing-crm.summary.md`)

# Sensing CRM — 제약·바이오 마켓 센싱 CRM (강의용 데모)

자동화(A-1·A-2·A-5)가 CRM 데이터 품질을 높이고, 그 품질이 이탈위험 예측(P-2)과 다음 행동 추천(O-2)의 성패를 좌우한다는 것을 시연하는 로컬 웹앱입니다. 모든 데이터는 합성·가상 데이터입니다.

## 현재 단계: 0단계 PRD (to-prd / bkit PDCA)

| 파일 | 내용 |
|---|---|
| `docs/PRD.md` | 요구사항 정본 (v1.0) |
| `docs/PRD.html` | 읽기용 HTML |
| `docs/DESIGN.md` | 디자인 시스템 (Pretendard) |
| `docs/00-pm/{feature}.prd.md` | bkit feature 파생본 9개 |
| `docs/00-pm/*.gate.md` | 착수 게이트 결과 |
| `docs/00-pm/_decisions.md` | 작성자 결정 요청 |
| `CLAUDE.md` | bkit 실행 규칙 |

PRD 도구:

```bash
node scripts/validate_prd.mjs docs/PRD.md
node scripts/gen_feature_prds.mjs
node scripts/render_prd_html.mjs docs/PRD.md docs/PRD.html
```

다음 단계: `/pdca plan foundation-auth`

# Sensing CRM

제약·바이오 마켓 센싱 CRM 강의용 데모(로컬 SQLite, localhost).

<!-- to-prd:begin — docs/PRD.md에서 생성됨. 직접 고치지 말고 PRD를 갱신한 뒤 to-prd를 다시 실행할 것 -->
## to-prd 실행 규칙

- 요구사항 정본은 `docs/PRD.md`(정본 개정 v1.2)다. feature 기준은 `docs/00-pm/{feature}.prd.md`다.
- UI는 `docs/DESIGN.md`를 따른다. 폰트는 Pretendard만 사용한다. 컴포넌트는 PRD 9장 컴포넌트 목록의 이름만 사용한다.
- PRD 3장 비목표(NG-*)에 있는 기능은 구현하지 않는다. 필요해 보이면 구현하지 말고 PRD 갱신을 먼저 요청한다.
- 모든 UI 요소에 PRD 요소 ID를 `data-testid` 값으로 붙인다. E2E 셀렉터는 `data-testid`만 사용한다.
- `/pdca analyze`(Check) 단계에서 다음 명령을 실제로 실행하고 결과를 analysis 문서에 기록한다: `npm run test` · `npm run test:e2e`
- 완료는 두 관문이다. match rate 95% 이상, 그리고 위 테스트 전체 통과. 하나라도 실패하면 `/pdca report`로 넘어가지 않는다.
<!-- to-prd:end -->

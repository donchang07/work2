import { test, expect, type Page } from '@playwright/test';
import { accountId, axeClean, config, login, reset } from './helpers';

const NOTE = '공정개발팀 김 팀장 미팅. 신규 생산 라인용 세포배양 배지 공급 검토. 관심 제품은 세포배양 배지, 일회용 바이오리액터 백. 알파사이언스 제품과 비교 평가 중이라고 언급함. 납기 지연이 반복되어 불만을 표시함. 다음 단계: 기술 자료와 견적서를 송부한다. 다음 접촉 2026-12-01 예정.';
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const field = (page: Page, label: string) => page.locator(`[data-testid="SCR-004-EL-06"][data-field="${label}"]`);
async function fill(page: Page, acc: number) {
  await page.getByTestId('SCR-004-EL-01').selectOption(String(acc));
  await page.getByTestId('SCR-004-EL-02').fill(yesterday());
  await page.getByTestId('SCR-004-EL-03').fill(NOTE);
}
test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-020 메모 검증: 9자·미래 날짜·고객 미선택', async ({ page, request }) => {
  const acc = await accountId(request, '송도바이오로직스');
  await login(page, 'kam1');
  await page.goto('/notes');
  await expect(page.getByTestId('SCR-004-RESULT-EMPTY')).toHaveText('메모를 입력하고 AI로 구조화하세요');
  await page.getByTestId('SCR-004-EL-03').fill('123456789');
  await expect(page.getByTestId('SCR-004-EL-13').filter({ hasText: '메모는 10자 이상 입력하세요' })).toBeVisible();
  await expect(page.getByTestId('SCR-004-EL-13').filter({ hasText: '고객을 선택하세요' })).toBeVisible();
  await expect(page.getByTestId('SCR-004-EL-04')).toBeDisabled();
  await page.getByTestId('SCR-004-EL-01').selectOption(String(acc));
  await page.getByTestId('SCR-004-EL-03').fill(NOTE);
  await page.getByTestId('SCR-004-EL-02').fill('2099-01-01');
  await expect(page.getByTestId('SCR-004-EL-13').filter({ hasText: '미래 날짜는 입력할 수 없습니다' })).toBeVisible();
  await expect(page.getByTestId('SCR-004-EL-04')).toBeDisabled();
  await page.getByTestId('SCR-004-EL-02').fill(yesterday());
  await expect(page.getByTestId('SCR-004-EL-04')).toBeEnabled();
});

test('SC-021 mock 구조화 → 1필드 수정 → 확정 저장', async ({ page, request }) => {
  const acc = await accountId(request, '송도바이오로직스');
  await login(page, 'kam1');
  await page.goto('/notes');
  await expect(page.getByTestId('SCR-004-EL-09-ROW').first()).toBeVisible();
  const before = await page.getByTestId('SCR-004-EL-09-ROW').count();
  await fill(page, acc);
  await page.route('**/api/notes/structure', async r => { await new Promise(x => setTimeout(x, 400)); await r.continue(); });
  await page.getByTestId('SCR-004-EL-04').click();
  await expect(page.getByTestId('SCR-004-EL-04')).toHaveAttribute('data-loading', 'true');
  await expect(page.getByTestId('SCR-004-EL-05')).toHaveText('추출: Claude');
  await expect(page.getByTestId('SCR-004-EL-06')).toHaveCount(7);
  await expect(field(page, '경쟁사 언급')).toContainText('AI 제안: 알파사이언스');
  await expect(field(page, '관심 제품군')).toContainText('세포배양 배지');
  await expect(field(page, '다음 접촉 예정일')).toContainText('2026-12-01');
  await field(page, '니즈').locator('input').fill('신규 라인 배지 공급 견적 요청');
  await expect(field(page, '니즈')).toHaveAttribute('data-changed', 'true');
  await page.getByTestId('SCR-004-EL-07').click();
  await expect(page.getByTestId('SCR-004-EL-14')).toHaveText('활동을 확정 저장했습니다');
  await expect(page.getByTestId('SCR-004-EL-09-ROW')).toHaveCount(Math.min(before + 1, 10));
  const top = page.getByTestId('SCR-004-EL-09-ROW').first();
  await expect(top).toContainText('송도바이오로직스');
  await expect(top).toContainText('확정');
  await expect(top.getByTestId('SCR-004-CORRECTED')).toHaveText('1');
});

test('SC-022 AI 실패 → 대체 배너·규칙 기반, 저장 성공', async ({ page, request }) => {
  const acc = await accountId(request, '송도바이오로직스');
  await config(request, { aiMode: 'fail' });
  await login(page, 'kam1');
  await page.goto('/notes');
  await fill(page, acc);
  await page.getByTestId('SCR-004-EL-04').click();
  await expect(page.getByTestId('SCR-004-EL-11')).toContainText('AI 구조화에 실패해 규칙 기반 결과로 대체했습니다.');
  await expect(page.getByTestId('SCR-004-EL-05')).toHaveText('추출: 규칙 기반');
  await page.getByTestId('SCR-004-EL-07').click();
  await expect(page.getByTestId('SCR-004-EL-14')).toHaveText('활동을 확정 저장했습니다');
});

test('SC-023 확정 취소 → 초안', async ({ page, request }) => {
  const acc = await accountId(request, '송도바이오로직스');
  await login(page, 'kam1');
  await page.goto('/notes');
  await fill(page, acc);
  await page.getByTestId('SCR-004-EL-04').click();
  await page.getByTestId('SCR-004-EL-07').click();
  await expect(page.getByTestId('SCR-004-EL-14')).toBeVisible();
  const top = page.getByTestId('SCR-004-EL-09-ROW').first();
  await top.getByTestId('SCR-004-EL-10').click();
  await expect(page.getByTestId('SCR-004-EL-14')).toHaveText('확정을 취소했습니다');
  await expect(page.getByTestId('SCR-004-EL-09-ROW').first()).toContainText('초안');
  await expect(page.getByTestId('SCR-004-EL-09-ROW').first().getByTestId('SCR-004-EL-10')).toHaveCount(0);
});

test('SC-024 작성 중 취소 → 확인 모달(계속 작성/버리기)', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/notes');
  await page.getByTestId('SCR-004-EL-03').fill('작성 중인 미팅 메모입니다');
  await page.getByTestId('SCR-004-EL-08').click();
  await expect(page.getByTestId('SCR-004-EL-12')).toContainText('작성 중인 내용을 버릴까요?');
  await page.getByTestId('SCR-004-EL-12-KEEP').click();
  await expect(page.getByTestId('SCR-004-EL-03')).toHaveValue('작성 중인 미팅 메모입니다');
  await page.getByTestId('SCR-004-EL-08').click();
  await page.getByTestId('SCR-004-EL-12-DISCARD').click();
  await expect(page.getByTestId('SCR-004-EL-03')).toHaveValue('');
  await expect(page.getByTestId('SCR-004-EL-08')).toHaveCount(0);
});

test('SC-009 미팅 노트: 범위 밖 고객 미노출, 고객 미리 선택', async ({ page, request }) => {
  const mine = await accountId(request, '가람제약');
  await login(page, 'kam1');
  await page.goto(`/notes?account=${mine}`);
  await expect(page.getByTestId('SCR-004-EL-01')).toHaveValue(String(mine));
  const opts = await page.getByTestId('SCR-004-EL-01').locator('option').allTextContents();
  expect(opts).not.toContain('청라바이오텍');
});

test('NFR-03 접근성: 미팅 노트(구조화 결과 포함)', async ({ page, request }) => {
  const acc = await accountId(request, '송도바이오로직스');
  await login(page, 'kam1');
  await page.goto('/notes');
  await fill(page, acc);
  await page.getByTestId('SCR-004-EL-04').click();
  await expect(page.getByTestId('SCR-004-EL-06')).toHaveCount(7);
  await axeClean(page);
});

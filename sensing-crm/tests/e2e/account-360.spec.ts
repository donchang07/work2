import { test, expect } from '@playwright/test';
import { accountId, axeClean, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-032 별칭 검색·세그먼트 필터·결과 없음', async ({ page }) => {
  await login(page, 'kam1');
  await page.getByTestId('NAV-04').click();
  await expect(page.getByTestId('SCR-005-ROW').first()).toBeVisible();
  await page.getByTestId('SCR-005-EL-01').fill('SDBL');
  await expect(page.getByTestId('SCR-005-ROW')).toHaveCount(1);
  await expect(page.getByTestId('SCR-005-ROW').first()).toContainText('송도바이오로직스');
  await page.getByTestId('SCR-005-EL-01').fill('없는회사이름');
  await expect(page.getByTestId('SCR-005-EL-04')).toContainText('검색 결과가 없습니다.');
  await page.getByTestId('SCR-005-EL-01').fill('');
  await page.getByTestId('SCR-005-EL-02').selectOption('제약');
  await expect(page.getByTestId('SCR-005-ROW').first()).toBeVisible();
  for (const t of await page.getByTestId('SCR-005-ROW').allTextContents()) expect(t).toContain('제약');
  await page.getByTestId('SCR-005-ROW').first().click();
  await expect(page).toHaveURL(/\/accounts\/\d+$/);
});

test('SC-033 고객 360 위젯·미팅 노트 이동·주문 없는 고객', async ({ page, request }) => {
  const id = await accountId(request, '해오름바이오솔루션');
  await login(page, 'kam1');
  await page.goto(`/accounts/${id}`);
  await expect(page.getByTestId('SCR-006-EL-01')).toContainText('해오름바이오솔루션');
  await expect(page.getByTestId('SCR-006-EL-02')).toHaveCount(4);
  await expect(page.getByTestId('SCR-006-EL-03')).toBeVisible();
  await expect(page.getByTestId('SCR-006-EL-04')).toBeVisible();
  for (const c of ['SCR-006-EL-05', 'SCR-006-EL-06', 'SCR-006-EL-07']) await expect(page.getByTestId(c)).toBeVisible();
  await page.getByTestId('SCR-006-EL-06-ALL').click();
  await expect(page).toHaveURL(new RegExp(`/actions\\?account=${id}`));
  await page.goBack();
  await page.getByTestId('SCR-006-EL-07-LINK').click();
  await expect(page).toHaveURL(new RegExp(`/quality\\?account=${id}`));
  await page.goBack();
  await page.getByTestId('SCR-006-EL-08').click();
  await expect(page).toHaveURL(new RegExp(`/notes\\?account=${id}`));
  await expect(page.getByTestId('SCR-004-EL-01')).toHaveValue(String(id));
  // 주문 없는 고객(kam2)
  const none = await accountId(request, '미르의과학원');
  await page.getByTestId('NAV-10').click(); await page.getByTestId('NAV-10-LOGOUT').click(); await page.waitForURL(/login/);
  await login(page, 'kam2');
  await page.goto(`/accounts/${none}`);
  await expect(page.getByTestId('SCR-006-EL-09').first()).toContainText('주문 이력이 없습니다.');
});

test('SC-009 고객 목록은 담당 범위만', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/accounts');
  await expect(page.getByTestId('SCR-005-ROW')).toHaveCount(13); // 담당 12 + 시연용 중복 1
  expect(await page.getByTestId('SCR-005-EL-03').textContent()).not.toContain('청라바이오텍');
});

test('SC-040 고객 API 500·없는 고객', async ({ page }) => {
  await login(page, 'admin');
  await page.route('**/api/accounts?*', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/accounts');
  await expect(page.getByTestId('SCR-005-ERROR')).toContainText('일시적인 오류입니다');
  await page.unroute('**/api/accounts?*');
  await page.goto('/accounts/99999');
  await expect(page.getByTestId('SCR-006-MISSING')).toContainText('고객을 찾을 수 없습니다.');
  await page.route('**/api/accounts/1', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/accounts/1');
  await expect(page.getByTestId('SCR-006-ERROR')).toBeVisible();
});

test('NFR-03 접근성: 고객 목록·고객 360', async ({ page, request }) => {
  const id = await accountId(request, '해오름바이오솔루션');
  await login(page, 'kam1');
  await page.goto('/accounts');
  await expect(page.getByTestId('SCR-005-ROW').first()).toBeVisible();
  await axeClean(page);
  await page.goto(`/accounts/${id}`);
  await expect(page.getByTestId('SCR-006-EL-03')).toBeVisible();
  await axeClean(page);
});

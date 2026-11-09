import { test, expect } from '@playwright/test';
import { axeClean, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-029 등급 필터·근거 모달·품질 경고·재계산', async ({ page }) => {
  await login(page, 'admin');
  await page.getByTestId('NAV-05').click();
  const rows = page.getByTestId('SCR-008-ROW');
  await expect(rows.first()).toBeVisible();
  const scores = await rows.evaluateAll(rs => rs.map(r => Number(r.querySelector('[role=meter]')!.getAttribute('aria-valuenow'))));
  expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  await page.getByTestId('SCR-008-EL-02').getByRole('button', { name: /^고/ }).click();
  await expect(rows.first().locator('[data-grade]')).toHaveAttribute('data-grade', '고');
  await expect(rows.locator('[data-grade="중"], [data-grade="저"]')).toHaveCount(0);
  for (const g of await rows.locator('[data-grade]').evaluateAll(es => es.map(e => e.getAttribute('data-grade')))) expect(g).toBe('고');
  await rows.first().getByTestId('SCR-008-EL-03').click();
  await expect(page.getByTestId('SCR-008-EL-04')).toBeVisible();
  await expect(page.getByTestId('SCR-008-FACTOR')).toHaveCount(5);
  await page.getByTestId('SCR-008-EL-04-CLOSE').click();
  await page.getByTestId('SCR-008-EL-02').getByRole('button', { name: '전체' }).click();
  await expect(page.getByTestId('SCR-008-EL-05').first()).toContainText('데이터 품질 경고');
  await page.getByTestId('SCR-008-EL-06').click();
  await expect(page.getByTestId('SCR-008-TOAST')).toHaveText('점수를 다시 계산했습니다');
  await rows.first().click();
  await expect(page).toHaveURL(/\/accounts\/\d+$/);
});

test('SC-029 빈 등급: 해당 고객 없음', async ({ page }) => {
  await login(page, 'kam2');
  await page.route('**/api/risk?grade=*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], counts: { 고: 0, 중: 0, 저: 0 } }) }));
  await page.goto('/risk');
  await page.getByTestId('SCR-008-EL-02').getByRole('button', { name: /^고/ }).click();
  await expect(page.getByTestId('SCR-008-EL-07')).toContainText('해당 등급의 고객이 없습니다.');
});

test('SC-009 위험 목록은 담당 범위만', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/risk');
  await expect(page.getByTestId('SCR-008-ROW').first()).toBeVisible();
  const text = await page.getByTestId('SCR-008-EL-01').textContent();
  expect(text).not.toContain('청라바이오텍');
  expect(text).not.toContain('빛길소재');
});

test('SC-040 위험 API 500 → 오류 배너', async ({ page }) => {
  await login(page, 'kam1');
  await page.route('**/api/risk', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/risk');
  await expect(page.getByTestId('SCR-008-ERROR')).toContainText('일시적인 오류입니다');
});

test('NFR-03 접근성: 위험 고객', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/risk');
  await expect(page.getByTestId('SCR-008-ROW').first()).toBeVisible();
  await axeClean(page);
});

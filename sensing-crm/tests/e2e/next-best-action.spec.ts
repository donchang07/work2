import { test, expect } from '@playwright/test';
import { accountId, axeClean, config, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-031 채택 → 채택 탭, 사유 없는 거절 차단, 보류', async ({ page }) => {
  await login(page, 'kam1');
  await page.getByTestId('NAV-06').click();
  const cards = page.getByTestId('SCR-009-EL-02');
  await expect(cards.first()).toBeVisible();
  const first = cards.first();
  const id = await first.getAttribute('data-rec-id');
  await first.getByTestId('SCR-009-EL-03').click();
  await expect(page.getByTestId('SCR-009-EL-08')).toHaveText('채택했습니다');
  await expect(page.locator(`[data-rec-id="${id}"]`)).toHaveCount(0);
  await page.getByTestId('SCR-009-EL-01').getByRole('tab', { name: '채택' }).click();
  await expect(page.locator(`[data-rec-id="${id}"]`)).toBeVisible();
  await page.getByTestId('SCR-009-EL-01').getByRole('tab', { name: /새 추천/ }).click();
  const c2 = cards.first();
  await c2.getByTestId('SCR-009-EL-05').click();
  await expect(c2.getByTestId('SCR-009-EL-06')).toBeVisible();
  await c2.getByTestId('SCR-009-EL-05').click();
  await expect(c2.getByTestId('SCR-009-EL-10')).toHaveText('거절 사유를 선택하세요');
  const id2 = await c2.getAttribute('data-rec-id');
  await c2.getByTestId('SCR-009-EL-06').selectOption('시점 부적절');
  await c2.getByTestId('SCR-009-EL-05').click();
  await expect(page.getByTestId('SCR-009-EL-08')).toHaveText('거절했습니다');
  const c3 = cards.first(); const id3 = await c3.getAttribute('data-rec-id');
  await c3.getByTestId('SCR-009-EL-04').click();
  await expect(page.getByTestId('SCR-009-EL-08')).toHaveText('보류했습니다');
  await page.getByTestId('SCR-009-EL-01').getByRole('tab', { name: '보류·거절' }).click();
  await expect(page.locator(`[data-rec-id="${id2}"]`)).toContainText('시점 부적절');
  await expect(page.locator(`[data-rec-id="${id3}"]`)).toContainText('보류');
});

test('SC-031 AI 꺼짐 → 설명: 규칙, mock → 설명: AI', async ({ page, request }) => {
  await login(page, 'kam1');
  await page.goto('/actions');
  await expect(page.getByTestId('SCR-009-EL-07').first()).toHaveText('설명: AI');
  await config(request, { aiMode: 'off' });
  await page.request.post('/api/risk/recompute');
  await page.reload();
  await expect(page.getByTestId('SCR-009-EL-07').first()).toBeVisible();
  expect(new Set(await page.getByTestId('SCR-009-EL-07').allTextContents())).toEqual(new Set(['설명: 규칙']));
});

test('SC-031 고객 필터·빈 상태', async ({ page, request }) => {
  const acc = await accountId(request, '해오름바이오솔루션');
  await login(page, 'kam1');
  await page.goto(`/actions?account=${acc}`);
  await expect(page.getByTestId('SCR-009-EL-02').first()).toBeVisible();
  for (const c of await page.getByTestId('SCR-009-EL-02').allTextContents()) expect(c).toContain('해오름바이오솔루션');
  const cards = page.getByTestId('SCR-009-EL-02');
  const n = await cards.count();
  for (let k = 0; k < n; k++) { await cards.first().getByTestId('SCR-009-EL-03').click(); await expect(cards).toHaveCount(n - k - 1); }
  await expect(page.getByTestId('SCR-009-EL-09')).toContainText('새 추천이 없습니다.');
});

test('SC-040 추천 API 500 → 오류 배너', async ({ page }) => {
  await login(page, 'kam1');
  await page.route('**/api/actions?*', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/actions');
  await expect(page.getByTestId('SCR-009-ERROR')).toContainText('일시적인 오류입니다');
});

test('NFR-03 접근성: 다음 행동', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/actions');
  await expect(page.getByTestId('SCR-009-EL-02').first()).toBeVisible();
  await axeClean(page);
});

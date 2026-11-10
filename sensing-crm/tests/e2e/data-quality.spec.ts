import { test, expect, type Page } from '@playwright/test';
import { accountId, axeClean, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });
const metric = async (page: Page, k: string) => Number((await page.locator(`[data-metric="${k}"] [data-role="value"]`).textContent())!.replace('%', ''));

test('SC-026 관리자 통합 승인 → 대기열 감소·일관성 상승·스냅샷 증가', async ({ page }) => {
  await login(page, 'admin');
  await page.getByTestId('NAV-07').click();
  await expect(page.getByTestId('SCR-007-EL-01')).toHaveCount(6);
  const queue = page.getByTestId('SCR-007-EL-05');
  const n = Number(await queue.getAttribute('data-count'));
  expect(n).toBeGreaterThan(0);
  const cons = await metric(page, 'consistency');
  const points = Number(await page.getByTestId('SCR-007-EL-02').getAttribute('data-points'));
  const item = page.getByTestId('SCR-007-QUEUE-ITEM').first();
  await expect(page.getByTestId('SCR-007-QUEUE-ITEM').first()).toHaveAttribute('data-issue-type', 'unresolved_name');
  await item.getByTestId('SCR-007-EL-06').click();
  await expect(page.getByTestId('SCR-007-TOAST')).toHaveText('통합했습니다');
  await expect(queue).toHaveAttribute('data-count', String(n - 1));
  expect(await metric(page, 'consistency')).toBeGreaterThan(cons);
  await expect(page.getByTestId('SCR-007-EL-02')).toHaveAttribute('data-points', String(Math.min(points + 1, 8)));
  // 이슈 유형 필터
  await page.getByTestId('SCR-007-EL-03').selectOption('late_entry');
  await expect(page.getByTestId('SCR-007-EL-04-ROW').first()).toContainText('기록 지연');
  for (const t of await page.getByTestId('SCR-007-EL-04-ROW').allTextContents()) expect(t).toContain('기록 지연');
  // 다른 고객(기각)
  const before = Number(await queue.getAttribute('data-count'));
  await page.getByTestId('SCR-007-QUEUE-ITEM').first().getByTestId('SCR-007-EL-07').click();
  await expect(queue).toHaveAttribute('data-count', String(before - 1));
});

test('FR-028 고객 범위 품질 화면: 추세도 그 고객 기준이고 통합하면 그 고객 일관성이 오른다', async ({ page, request }) => {
  const id = await accountId(request, '가람제약');
  await login(page, 'admin');
  await page.goto(`/quality?account=${id}`);
  await expect(page.getByTestId('SCR-007-EL-02')).toBeVisible();
  await expect(page.getByTestId('SCR-007-EL-02')).toHaveAttribute('aria-label', '가람제약 품질 추세');
  const overall = await metric(page, 'overall');
  const r = await page.request.get(`/api/quality?account=${id}`);
  const d = await r.json();
  expect(Math.round(d.trend[d.trend.length - 1].overall * 100)).toBe(overall);
  const points = Number(await page.getByTestId('SCR-007-EL-02').getAttribute('data-points'));
  const cons = await metric(page, 'consistency');
  await page.getByTestId('SCR-007-QUEUE-ITEM').filter({ hasText: '가람제약사' }).getByTestId('SCR-007-EL-06').click();
  await expect(page.getByTestId('SCR-007-TOAST')).toHaveText('통합했습니다');
  await expect(page.getByTestId('SCR-007-EL-02')).toHaveAttribute('data-points', String(Math.min(points + 1, 8)));
  expect(await metric(page, 'consistency')).toBeGreaterThan(cons);
});

test('SC-027 KAM: 통합 버튼 없음, 통합 API 403', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/quality');
  await expect(page.getByTestId('SCR-007-EL-01').first()).toBeVisible();
  await expect(page.getByTestId('SCR-007-EL-06')).toHaveCount(0);
  await expect(page.getByTestId('SCR-007-EL-07')).toHaveCount(0);
  const r = await page.request.post('/api/quality/issues/1', { data: { action: 'merge' } });
  expect(r.status()).toBe(403);
});

test('SC-040 품질 API 500 → 오류 배너', async ({ page }) => {
  await login(page, 'kam1');
  await page.route('**/api/quality?*', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/quality');
  await expect(page.getByTestId('SCR-007-ERROR')).toContainText('일시적인 오류입니다');
});

test('NFR-03 접근성: 데이터 품질', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/quality');
  await expect(page.getByTestId('SCR-007-EL-02')).toBeVisible();
  await axeClean(page);
});

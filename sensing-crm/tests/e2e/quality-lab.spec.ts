import { test, expect } from '@playwright/test';
import { axeClean, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-035 실험 실행 → 표 5열·차트·핵심 메시지·이력', async ({ page }) => {
  await login(page, 'admin');
  await page.getByTestId('NAV-08').click();
  await expect(page.getByTestId('SCR-010-EL-01')).toContainText('정답 이탈 고객 6곳');
  await expect(page.getByTestId('SCR-010-EL-08')).toContainText('아직 실험 결과가 없습니다.');
  await page.route('**/api/lab/run', async r => { await new Promise(x => setTimeout(x, 400)); await r.continue(); });
  await page.getByTestId('SCR-010-EL-02').click();
  await expect(page.getByTestId('SCR-010-EL-02')).toContainText('5개 데이터셋 평가 중');
  await expect(page.getByTestId('SCR-010-EL-03')).toBeVisible();
  await expect(page.getByTestId('SCR-010-EL-03').locator('th[data-ratio]')).toHaveCount(5);
  await expect(page.getByTestId('SCR-010-EL-03').locator('tr[data-metric]')).toHaveCount(4);
  await expect(page.getByTestId('SCR-010-EL-04')).toHaveAttribute('data-points', '5');
  await expect(page.getByTestId('SCR-010-EL-05')).toContainText('자동화 100%의 이탈 탐지 재현율 100% vs 0%의 17%');
  await expect(page.getByTestId('SCR-010-EL-06-ROW')).toHaveCount(1);
  await page.getByTestId('SCR-010-EL-02').click();
  await expect(page.getByTestId('SCR-010-EL-06-ROW')).toHaveCount(2);
  await page.getByTestId('SCR-010-EL-06-ROW').last().click();
  await expect(page.getByTestId('SCR-010-EL-06-ROW').last()).toContainText('표시 중');
});

test('SC-036 실험 API 500 → 오류 배너', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/lab');
  await page.route('**/api/lab/run', r => r.fulfill({ status: 500, body: '{}' }));
  await page.getByTestId('SCR-010-EL-02').click();
  await expect(page.getByTestId('SCR-010-EL-07')).toHaveText(/실험을 실행하지 못했습니다\. 다시 시도하세요\./);
});

test('NFR-03 접근성: 실험실', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/lab');
  await page.getByTestId('SCR-010-EL-02').click();
  await expect(page.getByTestId('SCR-010-EL-03')).toBeVisible();
  await axeClean(page);
});

import { test, expect } from '@playwright/test';
import { axeClean, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });
const row = (page: import('@playwright/test').Page, status: string) => page.getByTestId('SCR-003-ROW').filter({ has: page.locator(`[data-match-status="${status}"]`) }).first();

test('SC-017 수락: 후보는 고객 선택 전 차단, 수락 후 수락 탭', async ({ page }) => {
  await login(page, 'kam1');
  await page.getByTestId('NAV-02').click();
  await expect(page.getByTestId('SCR-003-EL-02')).toBeVisible();
  const cand = row(page, 'candidate');
  const org = (await cand.locator('strong').textContent())!;
  await cand.getByTestId('SCR-003-EL-03').click();
  await expect(cand.getByTestId('SCR-003-EL-10')).toHaveText('매칭할 고객을 선택하세요');
  const sel = cand.getByTestId('SCR-003-EL-06');
  const first = await sel.locator('option').nth(1).getAttribute('value');
  await sel.selectOption(first!);
  await cand.getByTestId('SCR-003-EL-03').click();
  await expect(page.getByTestId('SCR-003-EL-08')).toHaveText('리드를 수락했습니다');
  await page.getByTestId('SCR-003-EL-01').getByRole('tab', { name: '수락' }).click();
  await expect(page.getByTestId('SCR-003-ROW').filter({ hasText: org })).toBeVisible();
  // 자동 매칭 리드는 바로 수락
  await page.getByTestId('SCR-003-EL-01').getByRole('tab', { name: /검토 대기/ }).click();
  const auto = row(page, 'auto');
  const autoOrg = (await auto.locator('strong').textContent())!;
  await auto.getByTestId('SCR-003-EL-03').click();
  await expect(page.getByTestId('SCR-003-EL-08')).toBeVisible();
  await expect(page.getByTestId('SCR-003-ROW').filter({ hasText: autoOrg })).toHaveCount(0);
});

test('SC-018 거절: 사유 필수, 거절 탭 이동, 모두 처리 시 빈 상태', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/leads');
  const rows = page.getByTestId('SCR-003-ROW');
  await expect(rows.first()).toBeVisible();
  const total = await rows.count();
  const r = rows.first();
  const org = (await r.locator('strong').textContent())!;
  await r.getByTestId('SCR-003-EL-04').click();
  await expect(r.getByTestId('SCR-003-EL-05')).toBeVisible();
  await r.getByTestId('SCR-003-EL-04').click();
  await expect(r.getByTestId('SCR-003-EL-10')).toHaveText('거절 사유를 선택하세요');
  await r.getByTestId('SCR-003-EL-05').selectOption('정보 부족');
  await r.getByTestId('SCR-003-EL-04').click();
  await expect(page.getByTestId('SCR-003-EL-08')).toHaveText('리드를 거절했습니다');
  await expect(rows).toHaveCount(total - 1);
  await page.getByTestId('SCR-003-EL-01').getByRole('tab', { name: '거절' }).click();
  await expect(page.getByTestId('SCR-003-ROW').filter({ hasText: org })).toContainText('정보 부족');
  await page.getByTestId('SCR-003-EL-01').getByRole('tab', { name: /검토 대기/ }).click();
  for (let i = 0; i < total - 1; i++) {
    const x = page.getByTestId('SCR-003-ROW').first();
    await x.getByTestId('SCR-003-EL-04').click();
    await x.getByTestId('SCR-003-EL-05').selectOption('중복');
    await x.getByTestId('SCR-003-EL-04').click();
    await expect(page.getByTestId('SCR-003-ROW')).toHaveCount(total - 2 - i);
  }
  await expect(page.getByTestId('SCR-003-EL-09')).toContainText('검토할 리드가 없습니다.');
});

test('SC-019 담당자 지정은 관리자만, 변경 후 새 담당 KAM 인박스에 보임', async ({ page }) => {
  await login(page, 'kam1');
  await page.goto('/leads');
  await expect(page.getByTestId('SCR-003-ROW').first()).toBeVisible();
  await expect(page.getByTestId('SCR-003-EL-07')).toHaveCount(0);
  await page.getByTestId('NAV-10').click(); await page.getByTestId('NAV-10-LOGOUT').click(); await page.waitForURL(/login/);
  await login(page, 'admin');
  await page.goto('/leads');
  const r = page.getByTestId('SCR-003-ROW').filter({ hasText: '새봄바이오' });
  await r.getByTestId('SCR-003-EL-07').selectOption({ label: '이바다' });
  await expect(page.getByTestId('SCR-003-EL-08')).toHaveText('담당자를 변경했습니다');
  await page.getByTestId('NAV-10').click(); await page.getByTestId('NAV-10-LOGOUT').click(); await page.waitForURL(/login/);
  await login(page, 'kam2');
  await page.goto('/leads');
  await expect(page.getByTestId('SCR-003-ROW').filter({ hasText: '새봄바이오' })).toBeVisible();
});

test('SC-040 리드 API 500 → 오류 배너', async ({ page }) => {
  await login(page, 'kam1');
  await page.route('**/api/leads?*', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/leads');
  await expect(page.getByTestId('SCR-003-ERROR')).toContainText('일시적인 오류입니다');
  await expect(page.getByTestId('SCR-003-ERROR-RETRY')).toBeVisible();
});

test('NFR-03 접근성: 리드 인박스', async ({ page }) => {
  await login(page, 'admin');
  await page.goto('/leads');
  await expect(page.getByTestId('SCR-003-ROW').first()).toBeVisible();
  await axeClean(page);
});

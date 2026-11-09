import { test, expect } from '@playwright/test';
import { axeClean, config, login, reset } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-011 브리핑 카드·타일·필터·고객 360 이동', async ({ page }) => {
  await login(page, 'kam1');
  await expect(page.getByTestId('SCR-002-EL-01')).toContainText('오늘의 브리핑');
  const cards = page.getByTestId('SCR-002-EL-04');
  await expect(cards.first()).toBeVisible();
  const n = await cards.count();
  expect(n).toBeGreaterThanOrEqual(1);
  await expect(page.getByTestId('SCR-002-EL-02').first()).toContainText(`${n}건`);
  const acc = await cards.first().getAttribute('data-account-id');
  await page.getByTestId('SCR-002-EL-03').selectOption(acc!);
  await expect(cards.first()).toBeVisible();
  for (const id of await cards.evaluateAll(els => els.map(e => e.getAttribute('data-account-id')))) expect(id).toBe(acc);
  await cards.first().getByTestId('SCR-002-EL-06').click();
  await expect(page).toHaveURL(new RegExp(`/accounts/${acc}$`));
});

test('SC-012 오늘 신호 0건 빈 상태, 관리자만 운영 버튼', async ({ page, request }) => {
  await reset(request, 'empty-today');
  await login(page, 'kam1');
  await expect(page.getByTestId('SCR-002-EL-08')).toContainText('오늘 새 신호가 없습니다.');
  await expect(page.getByTestId('SCR-002-EL-09')).toHaveCount(0);
  await page.getByTestId('NAV-10').click(); await page.getByTestId('NAV-10-LOGOUT').click(); await page.waitForURL(/login/);
  await login(page, 'admin');
  await expect(page.getByTestId('SCR-002-EL-08')).toBeVisible();
  await page.getByTestId('SCR-002-EL-09').click();
  await expect(page).toHaveURL(/\/admin\/ops/);
});

test('SC-013 AI 꺼짐 수집 → 규칙 요약', async ({ page, request }) => {
  await reset(request, 'empty-today');
  await config(request, { aiMode: 'off' });
  await login(page, 'admin');
  await page.goto('/admin/ops');
  await expect(page.getByTestId('SCR-011-EL-06')).toHaveText('AI: 꺼짐(규칙 기반)');
  await page.getByTestId('SCR-011-EL-01').click();
  await expect(page.getByTestId('SCR-011-EL-07')).toBeVisible();
  await page.goto('/briefing');
  await expect(page.getByTestId('SCR-002-EL-05').first()).toBeVisible();
  const labels = await page.getByTestId('SCR-002-EL-05').allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  expect(new Set(labels)).toEqual(new Set(['규칙 요약']));
});

test('SC-014 수집 실행 → 로그·카드 증가, 재실행 중복 제외', async ({ page }) => {
  await login(page, 'admin');
  const before = await page.getByTestId('SCR-002-EL-04').count();
  await page.goto('/admin/ops');
  await expect(page.getByTestId('SCR-011-EL-06')).toHaveText('AI: 모의 응답');
  await expect(page.getByTestId('SCR-011-EL-05')).toHaveText('실행 기록이 없습니다.');
  await page.getByTestId('SCR-011-EL-01').click();
  await expect(page.getByTestId('SCR-011-EL-07')).toContainText(/신호 \d+건을 수집했습니다\(중복 \d+건 제외\)/);
  await expect(page.getByTestId('SCR-011-EL-05-ROW')).toHaveCount(1);
  await expect(page.getByTestId('SCR-011-EL-01')).toBeDisabled();
  await expect(page.getByTestId('SCR-011-EMPTY-FEED')).toBeVisible();
  const again = await (await page.request.post('/api/ops/collect')).json();
  expect(again.count).toBe(0);
  expect(again.skipped).toBeGreaterThan(0);
  await page.goto('/briefing');
  await expect(page.getByTestId('SCR-002-EL-04').first()).toBeVisible();
  expect(await page.getByTestId('SCR-002-EL-04').count()).toBeGreaterThan(before);
});

test('SC-015 초기화 모달 취소/확인', async ({ page, request }) => {
  const seed = await (await request.get('/api/test/counts')).json();
  await login(page, 'admin');
  await page.goto('/admin/ops');
  await page.getByTestId('SCR-011-EL-01').click();
  await expect(page.getByTestId('SCR-011-EL-07')).toBeVisible();
  await page.getByTestId('SCR-011-EL-02').click();
  await expect(page.getByTestId('SCR-011-EL-07')).toContainText('리드');
  const changed = await (await request.get('/api/test/counts')).json();
  expect(changed.leads).toBeGreaterThan(seed.leads);
  await page.getByTestId('SCR-011-EL-03').click();
  await expect(page.getByTestId('SCR-011-EL-04')).toBeVisible();
  await page.getByTestId('SCR-011-EL-04-CANCEL').click();
  await expect(page.getByTestId('SCR-011-EL-04')).toHaveCount(0);
  expect((await (await request.get('/api/test/counts')).json()).leads).toBe(changed.leads);
  await page.getByTestId('SCR-011-EL-03').click();
  await page.getByTestId('SCR-011-EL-04-CONFIRM').click();
  await expect(page.getByTestId('SCR-011-EL-07')).toHaveText('초기화했습니다');
  const after = await (await request.get('/api/test/counts')).json();
  expect(after.leads).toBe(seed.leads);
  expect(after.activities).toBe(seed.activities);
});

test('SC-040 브리핑·운영 API 500 → 오류 배너와 다시 시도', async ({ page }) => {
  await login(page, 'admin');
  await page.route('**/api/briefing*', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/briefing');
  await expect(page.getByTestId('SCR-002-ERROR')).toContainText('일시적인 오류입니다');
  await expect(page.getByTestId('SCR-002-ERROR-RETRY')).toBeVisible();
  await page.route('**/api/ops', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/admin/ops');
  await expect(page.getByTestId('SCR-011-ERROR')).toBeVisible();
});

test('NFR-03 접근성: 브리핑·데이터 운영', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.getByTestId('SCR-002-EL-04').first()).toBeVisible();
  await axeClean(page);
  await page.goto('/admin/ops');
  await expect(page.getByTestId('SCR-011-EL-01')).toBeVisible();
  await axeClean(page);
});

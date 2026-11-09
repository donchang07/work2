import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { accountId, config, login, reset, USERS } from './helpers';

test.beforeEach(async ({ request }) => { await reset(request); });

test('SC-001 비로그인 보호 경로 → 로그인 리다이렉트', async ({ page }) => {
  await page.goto('/briefing');
  await expect(page).toHaveURL(/\/login\?next=%2Fbriefing/);
  await expect(page.getByTestId('SCR-001-EL-01')).toHaveValue('');
  await expect(page.getByTestId('SCR-001-EL-03')).toBeEnabled();
});

test('SC-002 KAM 로그인: 로딩 → 브리핑, 관리자 메뉴 없음', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('SCR-001-EL-01').fill(USERS.kam1);
  await page.getByTestId('SCR-001-EL-02').fill('e2e-pass-1234');
  await page.route('**/api/auth/login', async route => { await new Promise(r => setTimeout(r, 400)); await route.continue(); });
  await page.getByTestId('SCR-001-EL-03').click();
  await expect(page.getByTestId('SCR-001-EL-03')).toHaveAttribute('data-loading', 'true');
  await page.waitForURL(/\/briefing/);
  await expect(page.getByTestId('NAV-01')).toBeVisible();
  await expect(page.getByTestId('NAV-08')).toHaveCount(0);
  await expect(page.getByTestId('NAV-09')).toHaveCount(0);
});

test('SC-003 관리자 로그인: 관리자 메뉴 노출', async ({ page }) => {
  await login(page, 'admin');
  await expect(page.getByTestId('NAV-08')).toBeVisible();
  await expect(page.getByTestId('NAV-09')).toBeVisible();
});

test('SC-004 틀린 비밀번호: 오류 배너, URL 유지, 이메일 유지', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('SCR-001-EL-01').fill(USERS.kam1);
  await page.getByTestId('SCR-001-EL-02').fill('wrong-password');
  await page.getByTestId('SCR-001-EL-03').click();
  await expect(page.getByTestId('SCR-001-EL-04')).toHaveText('이메일 또는 비밀번호가 올바르지 않습니다.');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId('SCR-001-EL-01')).toHaveValue(USERS.kam1);
});

test('SC-005 빈 값·형식 오류: 검증 문구, 요청 미전송', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/auth/login', r => { calls++; return r.continue(); });
  await page.goto('/login');
  await page.getByTestId('SCR-001-EL-03').click();
  await expect(page.getByTestId('SCR-001-EL-07').first()).toHaveText('이메일을 입력하세요');
  await page.getByTestId('SCR-001-EL-01').fill('not-an-email');
  await page.getByTestId('SCR-001-EL-02').fill('x');
  await page.getByTestId('SCR-001-EL-03').click();
  await expect(page.getByTestId('SCR-001-EL-07')).toHaveText('올바른 이메일 형식이 아닙니다');
  expect(calls).toBe(0);
});

test('SC-006 세션 만료 → reason=expired 안내', async ({ page, request }) => {
  await login(page, 'kam1');
  await config(request, { nowOffsetMs: (8 * 60 + 1) * 60 * 1000 });
  await page.goto('/leads').catch(() => { /* 진행 중 fetch의 401 리다이렉트와 경합 가능 */ });
  await page.waitForURL(/\/login\?reason=expired/);
  await expect(page.getByTestId('SCR-001-EL-06')).toHaveText('세션이 만료되었습니다. 다시 로그인해 주세요.');
  await config(request, { nowOffsetMs: 0 });
});

test('SC-007 로그아웃 후 보호 경로 차단', async ({ page }) => {
  await login(page, 'kam1');
  await page.getByTestId('NAV-10').click();
  await page.getByTestId('NAV-10-LOGOUT').click();
  await page.waitForURL(/\/login/);
  await page.goto('/briefing');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId('SCR-001-EL-03')).toBeVisible();
});

test('SC-008 KAM 관리자 경로·API 차단', async ({ page }) => {
  await login(page, 'kam1');
  for (const p of ['/lab', '/admin/ops']) {
    await page.goto(p);
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByTestId('SCR-012-EL-01')).toContainText('이 화면을 볼 권한이 없습니다.');
  }
  await page.getByTestId('SCR-012-EL-02').click();
  await expect(page).toHaveURL(/\/briefing/);
  for (const api of ['/api/ops/collect', '/api/ops/convert', '/api/ops/reset', '/api/lab/run']) {
    const r = await page.request.post(api);
    expect(r.status(), api).toBe(403);
  }
});

test('SC-009 KAM 범위 밖 고객 접근 차단', async ({ page, request }) => {
  const other = await accountId(request, '청라바이오텍'); // kam2 담당
  await login(page, 'kam1');
  await page.goto(`/accounts/${other}`);
  await expect(page).toHaveURL(/\/forbidden/);
  await page.goto(`/notes?account=${other}`);
  await expect(page).toHaveURL(/\/forbidden/);
  const api = await page.request.get(`/api/accounts/${other}`);
  expect(api.status()).toBe(403);
});

test('SC-037 모바일 메뉴', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, 'kam1');
  await expect(page.getByTestId('NAV-01')).toBeHidden();
  await page.getByTestId('NAV-11').click();
  for (const n of ['01', '02', '03', '04', '05', '06', '07']) await expect(page.getByTestId(`NAV-${n}-M`)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('SC-040 로그인 API 500 → 시스템 오류 문구', async ({ page }) => {
  await page.route('**/api/auth/login', r => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/login');
  await page.getByTestId('SCR-001-EL-01').fill(USERS.kam1);
  await page.getByTestId('SCR-001-EL-02').fill('x');
  await page.getByTestId('SCR-001-EL-03').click();
  await expect(page.getByTestId('SCR-001-ERROR')).toHaveText('일시적인 오류입니다. 잠시 후 다시 시도하세요.');
});

test('NFR-03 접근성: 로그인·접근 거부 화면', async ({ page }) => {
  await page.goto('/login');
  const a = await new AxeBuilder({ page: page as never }).analyze();
  expect(a.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await login(page, 'kam1');
  await page.goto('/forbidden');
  const b = await new AxeBuilder({ page: page as never }).analyze();
  expect(b.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

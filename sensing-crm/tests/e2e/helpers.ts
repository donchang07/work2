import { expect, type Page, type APIRequestContext } from '@playwright/test';
export const PW = 'e2e-pass-1234';
export const USERS = { kam1: 'kam1@demo.local', kam2: 'kam2@demo.local', admin: 'admin@demo.local' } as const;
export async function reset(request: APIRequestContext, variant: 'default' | 'empty-today' = 'default') {
  const r = await request.post('/api/test/reset', { data: { variant } }); expect(r.ok()).toBeTruthy();
}
export async function config(request: APIRequestContext, c: { aiMode?: string; nowOffsetMs?: number }) {
  const r = await request.post('/api/test/config', { data: c }); expect(r.ok()).toBeTruthy();
}
export async function login(page: Page, who: keyof typeof USERS, next?: string) {
  await page.goto('/login' + (next ? `?next=${encodeURIComponent(next)}` : ''));
  await page.getByTestId('SCR-001-EL-01').fill(USERS[who]);
  await page.getByTestId('SCR-001-EL-02').fill(PW);
  await page.getByTestId('SCR-001-EL-03').click();
  await page.waitForURL(u => !u.pathname.startsWith('/login'));
}
/** 시드 고객 ID 조회 */
export async function accountId(request: APIRequestContext, name: string): Promise<number> {
  const r = await request.get(`/api/test/lookup?name=${encodeURIComponent(name)}`); const j = await r.json(); return j.id;
}
import AxeBuilder from '@axe-core/playwright';
export async function axeClean(page: Page) {
  const r = await new AxeBuilder({ page: page as never }).analyze();
  const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''));
  expect(bad.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

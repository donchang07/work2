import { test, expect } from '@playwright/test';
import { login, reset } from './helpers';

test('NFR-01 주요 API 응답 p95 1초 이내, 실험 10초 이내', async ({ page, request }) => {
  await reset(request);
  await login(page, 'admin');
  const apis = ['/api/briefing', '/api/leads?status=pending', '/api/notes', '/api/accounts?q=&segment=', '/api/accounts/1', '/api/quality?', '/api/risk', '/api/actions?status=new', '/api/ops', '/api/lab'];
  const times: number[] = [];
  for (let k = 0; k < 3; k++) for (const a of apis) { const t0 = Date.now(); const r = await page.request.get(a); expect(r.ok(), a).toBeTruthy(); times.push(Date.now() - t0); }
  times.sort((a, b) => a - b);
  const p95 = times[Math.floor(times.length * 0.95) - 1];
  console.log(`p95=${p95}ms max=${times.at(-1)}ms`);
  expect(p95).toBeLessThan(1000);
  const t0 = Date.now(); expect((await page.request.post('/api/lab/run')).ok()).toBeTruthy(); expect(Date.now() - t0).toBeLessThan(10_000);
});

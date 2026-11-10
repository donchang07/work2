import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/pw',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e.json' }]],
  use: { baseURL: 'http://localhost:3100', viewport: { width: 1440, height: 900 }, trace: 'off' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npx next build && npx next start -p 3100',
    url: 'http://localhost:3100/login',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { E2E: '1', DATABASE_PATH: 'data/test.db', AI_MODE: 'mock', SEED_PASSWORD: 'e2e-pass-1234', DATA_DIR: 'data/test-feeds' },
  },
});

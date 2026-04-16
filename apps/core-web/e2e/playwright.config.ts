import { defineConfig, devices } from '@playwright/test'

const E2E_PORT = 4173
const CI_RETRIES = 2
const CI_WORKERS = 1

export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? CI_RETRIES : 0,
  workers: process.env['CI'] ? CI_WORKERS : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !process.env['CI'],
    env: { E2E_BYPASS: 'true' },
  },
})

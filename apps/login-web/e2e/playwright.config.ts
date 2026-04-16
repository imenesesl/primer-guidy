import { defineConfig, devices } from '@playwright/test'

const E2E_PORT = 4174
const CI_RETRIES = 2

export default defineConfig({
  testDir: './flows',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? CI_RETRIES : 0,
  workers: 1,
  reporter: 'html',
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `E2E_BYPASS=true pnpm dev --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !process.env['CI'],
  },
})

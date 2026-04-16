import { test, expect } from '@playwright/test'
import { signInOnPage } from '@primer-guidy/e2e-helpers'
import { E2E_USER } from '../e2e.constants'

const AUTH_SETTLE_TIMEOUT_MS = 10_000

test.describe('Home page', () => {
  test('displays the greeting and welcome message after auth', async ({ page }) => {
    await page.goto('/')
    await signInOnPage(page, E2E_USER)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
      timeout: AUTH_SETTLE_TIMEOUT_MS,
    })
    await expect(page.getByText(/welcome to the core application/i)).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

const LINK_SENT_TIMEOUT_MS = 10_000

test.describe('Login form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows validation error when submitting empty email', async ({ page }) => {
    await page.getByRole('button', { name: /sign in without password/i }).click()

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  })

  test('shows link sent view after submitting valid email', async ({ page }) => {
    await page.getByPlaceholder(/email@example\.com/i).fill('e2e-login@primer-guidy.test')
    await page.getByRole('button', { name: /sign in without password/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })
    await expect(page.getByText(/we sent a sign-in link to your email address/i)).toBeVisible()
  })

  test('returns to login form when clicking Back on link sent view', async ({ page }) => {
    await page.getByPlaceholder(/email@example\.com/i).fill('e2e-login@primer-guidy.test')
    await page.getByRole('button', { name: /sign in without password/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })

    await page.getByRole('button', { name: /back/i }).click()

    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email@example\.com/i)).toBeVisible()
  })
})

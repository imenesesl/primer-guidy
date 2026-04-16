import { test, expect } from '@playwright/test'

const LINK_SENT_TIMEOUT_MS = 10_000

test.describe('Create account form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-account')
  })

  test('shows validation errors when submitting empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /create account with email/i }).click()

    await expect(page.getByText(/full name/i).last()).toBeVisible()
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  })

  test('shows link sent view after submitting valid name and email', async ({ page }) => {
    await page.getByPlaceholder(/your full name/i).fill('Test User')
    await page.getByPlaceholder(/email@example\.com/i).fill('new-user@primer-guidy.test')
    await page.getByRole('button', { name: /create account with email/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })
    await expect(page.getByText(/we sent a sign-in link to your email address/i)).toBeVisible()
  })

  test('returns to form when clicking Back on link sent view', async ({ page }) => {
    await page.getByPlaceholder(/your full name/i).fill('Test User')
    await page.getByPlaceholder(/email@example\.com/i).fill('new-user@primer-guidy.test')
    await page.getByRole('button', { name: /create account with email/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })

    await page.getByRole('button', { name: /back/i }).click()

    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.getByPlaceholder(/your full name/i)).toBeVisible()
  })
})

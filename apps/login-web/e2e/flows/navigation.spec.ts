import { test, expect } from '@playwright/test'

test.describe('Navigation between login and create account', () => {
  test('navigates from login to create account via "Create one" link', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()

    await page.getByRole('link', { name: /create one/i }).click()

    await expect(page).toHaveURL(/\/create-account/)
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })

  test('navigates from create account to login via "Sign In" link', async ({ page }) => {
    await page.goto('/create-account')

    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()

    await page.getByRole('link', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })
})

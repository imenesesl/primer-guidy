import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('displays the greeting and welcome message', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/welcome to the core application/i)).toBeVisible()
  })
})

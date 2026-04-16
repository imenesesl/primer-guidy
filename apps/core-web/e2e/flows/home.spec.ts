import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('displays the heading and welcome message', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Primer Guidy' })).toBeVisible()
    await expect(page.getByText(/welcome to the core application/i)).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import {
  clearEmulators,
  createAuthUser,
  getOobCodeForEmail,
  buildEmailLinkUrl,
} from '@primer-guidy/e2e-helpers'

const CREATE_ACCOUNT_EMAIL = 'new-account@primer-guidy.test'
const CREATE_ACCOUNT_PASSWORD = 'new-account-password-123'
const CREATE_ACCOUNT_NAME = 'New Account User'
const LINK_SENT_TIMEOUT_MS = 10_000
const REDIRECT_TIMEOUT_MS = 15_000

test.describe('Create account flow — full magic link round-trip', () => {
  test.beforeEach(async () => {
    await clearEmulators()
    await createAuthUser({
      email: CREATE_ACCOUNT_EMAIL,
      password: CREATE_ACCOUNT_PASSWORD,
      displayName: CREATE_ACCOUNT_NAME,
    })
  })

  test('fills form, completes magic link, creates user, and redirects to core', async ({
    page,
  }) => {
    await page.goto('/create-account')

    await page.getByPlaceholder(/your full name/i).fill(CREATE_ACCOUNT_NAME)
    await page.getByPlaceholder(/email@example\.com/i).fill(CREATE_ACCOUNT_EMAIL)
    await page.getByRole('button', { name: /create account with email/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })

    const oob = await getOobCodeForEmail(CREATE_ACCOUNT_EMAIL)
    const emailLinkUrl = buildEmailLinkUrl('/create-account', oob.oobCode)

    await page.goto(emailLinkUrl)

    await page.waitForURL(/\/core/, { timeout: REDIRECT_TIMEOUT_MS })
  })
})

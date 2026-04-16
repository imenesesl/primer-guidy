import { test, expect } from '@playwright/test'
import {
  clearEmulators,
  createAuthUser,
  getOobCodeForEmail,
  buildEmailLinkUrl,
} from '@primer-guidy/e2e-helpers'
import { E2E_USER } from '../e2e.constants'

const LINK_SENT_TIMEOUT_MS = 10_000
const BANNER_TIMEOUT_MS = 15_000

test.describe('Login flow — user without Firestore profile', () => {
  test.beforeEach(async () => {
    await clearEmulators()
    await createAuthUser(E2E_USER)
  })

  test('submits email, completes magic link, and shows account not found banner', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByPlaceholder(/email@example\.com/i).fill(E2E_USER.email)
    await page.getByRole('button', { name: /sign in without password/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })

    const oob = await getOobCodeForEmail(E2E_USER.email)
    const emailLinkUrl = buildEmailLinkUrl('/', oob.oobCode)

    await page.goto(emailLinkUrl)

    await expect(page.getByText(/you need to create an account first/i)).toBeVisible({
      timeout: BANNER_TIMEOUT_MS,
    })

    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })
})

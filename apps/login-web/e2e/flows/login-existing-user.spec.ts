import { test, expect } from '@playwright/test'
import {
  clearEmulators,
  createAuthUser,
  seedFirestoreProfile,
  getOobCodeForEmail,
  buildEmailLinkUrl,
} from '@primer-guidy/e2e-helpers'
import { E2E_USER } from '../e2e.constants'

const LINK_SENT_TIMEOUT_MS = 10_000
const REDIRECT_TIMEOUT_MS = 15_000

test.describe('Login flow — existing user with Firestore profile', () => {
  test.beforeEach(async () => {
    await clearEmulators()
    const uid = await createAuthUser(E2E_USER)
    await seedFirestoreProfile(uid, E2E_USER)
  })

  test('submits email, completes magic link, and redirects to core app', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder(/email@example\.com/i).fill(E2E_USER.email)
    await page.getByRole('button', { name: /sign in without password/i }).click()

    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: LINK_SENT_TIMEOUT_MS,
    })

    const oob = await getOobCodeForEmail(E2E_USER.email)
    const emailLinkUrl = buildEmailLinkUrl('/', oob.oobCode)

    await page.goto(emailLinkUrl)

    await page.waitForURL(/\/core/, { timeout: REDIRECT_TIMEOUT_MS })
  })
})

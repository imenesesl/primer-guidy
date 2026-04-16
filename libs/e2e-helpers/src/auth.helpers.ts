import type { Page } from '@playwright/test'

interface SignInCredentials {
  readonly email: string
  readonly password: string
}

const AUTH_READY_TIMEOUT_MS = 10_000

export const signInOnPage = async (page: Page, credentials: SignInCredentials): Promise<void> => {
  await page.waitForFunction(() => '__e2eAuth' in window, {
    timeout: AUTH_READY_TIMEOUT_MS,
  })

  await page.evaluate(
    async (creds) => {
      const auth = (window as unknown as Record<string, unknown>).__e2eAuth as {
        signInWithEmail: (c: { email: string; password: string }) => Promise<unknown>
      }
      await auth.signInWithEmail(creds)
    },
    { email: credentials.email, password: credentials.password },
  )
}

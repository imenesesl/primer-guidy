import type { E2EUserConfig } from '@primer-guidy/e2e-helpers'

export const E2E_USER: E2EUserConfig = {
  email: 'e2e-login@primer-guidy.test',
  password: 'e2e-login-password-123',
  displayName: 'E2E Login User',
} as const

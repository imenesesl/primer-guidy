import type { E2EUserConfig } from '@primer-guidy/e2e-helpers'

export const E2E_USER: E2EUserConfig = {
  email: 'e2e@primer-guidy.test',
  password: 'e2e-test-password-123',
  displayName: 'E2E User',
} as const

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Page } from '@playwright/test'
import { signInOnPage } from './auth.helpers'

const createMockPage = () => ({
  waitForFunction: vi.fn().mockResolvedValue(undefined),
  evaluate: vi.fn().mockResolvedValue(undefined),
})

describe('signInOnPage', () => {
  let mockPage: ReturnType<typeof createMockPage>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPage = createMockPage()
  })

  it('calls page.waitForFunction with correct timeout', async () => {
    await signInOnPage(mockPage as unknown as Page, {
      email: 'user@test.com',
      password: 'pass123',
    })

    expect(mockPage.waitForFunction).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 10_000,
    })
  })

  it('calls page.evaluate with credentials', async () => {
    const credentials = { email: 'user@test.com', password: 'pass123' }

    await signInOnPage(mockPage as unknown as Page, credentials)

    expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function), {
      email: 'user@test.com',
      password: 'pass123',
    })
  })
})

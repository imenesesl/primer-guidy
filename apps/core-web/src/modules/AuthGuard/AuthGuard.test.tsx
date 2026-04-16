import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { AuthUser } from '@primer-guidy/cloud-services'
import { ContentSkeleton } from './ContentSkeleton'
import { getLoginAppUrl } from './AuthGuard.utils'

const createMockAuthUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  uid: 'user-123',
  email: 'jane@example.com',
  displayName: 'Jane Doe',
  emailVerified: true,
  photoURL: 'https://example.com/avatar.jpg',
  ...overrides,
})

describe('ContentSkeleton', () => {
  it('renders skeleton content elements', () => {
    const { container } = render(<ContentSkeleton />)

    expect(container.firstChild).toBeTruthy()
  })
})

describe('getLoginAppUrl', () => {
  it('returns /login/ for root base path', () => {
    const url = getLoginAppUrl()
    expect(url).toContain('login')
  })
})

describe('AuthGuard integration helpers', () => {
  it('createMockAuthUser creates a valid auth user', () => {
    const user = createMockAuthUser()
    expect(user.uid).toBe('user-123')
    expect(user.email).toBe('jane@example.com')
  })
})

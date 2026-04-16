import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { UserDocument } from '@/services/user'
import { UserProvider, useCurrentUser } from './user.context'

const MOCK_USER: UserDocument = {
  uid: 'u-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: '2025-01-01T00:00:00Z',
}

const createWrapper =
  (user: UserDocument) =>
  ({ children }: { readonly children: ReactNode }) => (
    <UserProvider value={user}>{children}</UserProvider>
  )

describe('useCurrentUser', () => {
  it('throws when used outside UserProvider', () => {
    expect(() => renderHook(() => useCurrentUser())).toThrow(
      'useCurrentUser must be used within a UserProvider',
    )
  })

  it('returns user data when inside UserProvider', () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(MOCK_USER),
    })

    expect(result.current).toEqual(MOCK_USER)
  })

  it('returns the exact user object provided to the provider', () => {
    const customUser: UserDocument = {
      uid: 'u-2',
      name: 'John Smith',
      email: 'john@example.com',
      avatarUrl: null,
      createdAt: '2026-04-16T12:00:00Z',
    }

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(customUser),
    })

    expect(result.current.uid).toBe('u-2')
    expect(result.current.name).toBe('John Smith')
    expect(result.current.avatarUrl).toBeNull()
  })
})

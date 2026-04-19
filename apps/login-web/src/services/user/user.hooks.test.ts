import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseMutation = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

const mockFirestore = {}
vi.mock('@primer-guidy/cloud-services', () => ({ useFirestore: () => mockFirestore }))

vi.mock('./user.service', () => ({
  checkUserExists: vi.fn(),
  createUser: vi.fn(),
}))

import { useCheckUserExists, useCreateUser } from './user.hooks'
import { checkUserExists, createUser } from './user.service'

describe('useCheckUserExists', () => {
  beforeEach(() => {
    mockUseMutation.mockClear()
  })

  it('passes mutationFn that calls checkUserExists with firestore and uid', () => {
    useCheckUserExists()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as { mutationFn: (uid: string) => void }
    config.mutationFn('uid-1')
    expect(checkUserExists).toHaveBeenCalledWith(mockFirestore, 'uid-1')
  })
})

describe('useCreateUser', () => {
  beforeEach(() => {
    mockUseMutation.mockClear()
  })

  it('passes mutationFn that calls createUser with firestore, uid, and data', () => {
    useCreateUser()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: Record<string, unknown>) => void
    }
    const data = { name: 'Alice' }
    config.mutationFn({ uid: 'uid-1', data })
    expect(createUser).toHaveBeenCalledWith(mockFirestore, 'uid-1', data)
  })
})

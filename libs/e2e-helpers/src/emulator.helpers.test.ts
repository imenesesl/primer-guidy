import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  clearEmulators,
  clearEmulatorsSafe,
  createAuthUser,
  seedFirestoreProfile,
  type E2EUserConfig,
} from './emulator.helpers'

const mockUser: E2EUserConfig = {
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User',
}

const mockFetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', mockFetch)
})

describe('clearEmulators', () => {
  it('calls fetch twice with DELETE method on auth and firestore URLs', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await clearEmulators()

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'http://127.0.0.1:9099/emulator/v1/projects/guidy-app-ai/accounts',
      { method: 'DELETE' },
    )
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:8080/emulator/v1/projects/guidy-app-ai/databases/(default)/documents',
      { method: 'DELETE' },
    )
  })

  it('propagates fetch errors', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))

    await expect(clearEmulators()).rejects.toThrow('network error')
  })
})

describe('clearEmulatorsSafe', () => {
  it('calls fetch twice with DELETE method', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await clearEmulatorsSafe()

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'http://127.0.0.1:9099/emulator/v1/projects/guidy-app-ai/accounts',
      { method: 'DELETE' },
    )
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:8080/emulator/v1/projects/guidy-app-ai/databases/(default)/documents',
      { method: 'DELETE' },
    )
  })

  it('does not throw when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))

    await expect(clearEmulatorsSafe()).resolves.toBeUndefined()
  })
})

describe('createAuthUser', () => {
  it('calls fetch with POST and returns localId on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ localId: 'uid-123' }),
    })

    const result = await createAuthUser(mockUser)

    expect(result).toBe('uid-123')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockUser.email,
          password: mockUser.password,
          displayName: mockUser.displayName,
          returnSecureToken: true,
        }),
      },
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('bad request'),
    })

    await expect(createAuthUser(mockUser)).rejects.toThrow(
      'Failed to create auth user: bad request',
    )
  })
})

describe('seedFirestoreProfile', () => {
  it('calls fetch with POST and correct Firestore URL', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await seedFirestoreProfile('uid-123', mockUser)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/v1/projects/guidy-app-ai/databases/(default)/documents/users?documentId=uid-123',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.fields.uid.stringValue).toBe('uid-123')
    expect(body.fields.name.stringValue).toBe('Test User')
    expect(body.fields.email.stringValue).toBe('test@example.com')
    expect(body.fields.avatarUrl.nullValue).toBeNull()
    expect(body.fields.createdAt.stringValue).toBeDefined()
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('firestore error'),
    })

    await expect(seedFirestoreProfile('uid-123', mockUser)).rejects.toThrow(
      'Failed to seed Firestore profile: firestore error',
    )
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FirebaseConfig } from './config'

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn(),
}))

const { initializeApp, getApps, getApp } = await import('firebase/app')
const { initializeFirebase } = await import('./config')

const mockConfig: FirebaseConfig = {
  apiKey: 'test-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123',
  appId: '1:123:web:abc',
}

describe('initializeFirebase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls initializeApp with config when no apps exist', () => {
    vi.mocked(getApps).mockReturnValue([])
    const mockApp = {} as ReturnType<typeof initializeApp>
    vi.mocked(initializeApp).mockReturnValue(mockApp)

    initializeFirebase(mockConfig)

    expect(initializeApp).toHaveBeenCalledWith(mockConfig)
  })

  it('calls getApp when apps already exist', () => {
    vi.mocked(getApps).mockReturnValue([{} as never])
    const mockApp = {} as ReturnType<typeof getApp>
    vi.mocked(getApp).mockReturnValue(mockApp)

    initializeFirebase(mockConfig)

    expect(getApp).toHaveBeenCalled()
    expect(initializeApp).not.toHaveBeenCalled()
  })

  it('returns the FirebaseApp from initializeApp when no apps exist', () => {
    vi.mocked(getApps).mockReturnValue([])
    const mockApp = { name: 'test-app' } as ReturnType<typeof initializeApp>
    vi.mocked(initializeApp).mockReturnValue(mockApp)

    const result = initializeFirebase(mockConfig)

    expect(result).toBe(mockApp)
  })

  it('returns the FirebaseApp from getApp when apps exist', () => {
    vi.mocked(getApps).mockReturnValue([{} as never])
    const mockApp = { name: 'existing-app' } as ReturnType<typeof getApp>
    vi.mocked(getApp).mockReturnValue(mockApp)

    const result = initializeFirebase(mockConfig)

    expect(result).toBe(mockApp)
  })
})

import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { CloudServicesProvider } from './provider'
import {
  useCloudServices,
  useAuth,
  useRealtimeDatabase,
  useFirestore,
  useHosting,
  useFunctions,
} from './hooks'
import type { CloudServices } from '../factory.types'

const mockServices: CloudServices = {
  auth: {
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    sendSignInLink: vi.fn(),
    signInWithEmailLink: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInAnonymously: vi.fn(),
    signInWithCustomToken: vi.fn(),
    signOut: vi.fn(),
    sendEmailVerification: vi.fn(),
    getIdToken: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  realtimeDatabase: {
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    push: vi.fn(),
    onValue: vi.fn(),
  },
  firestore: {
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  },
  hosting: {
    getProjectUrl: vi.fn(),
    getPreviewUrl: vi.fn(),
  },
  functions: {
    call: vi.fn(),
  },
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <CloudServicesProvider value={mockServices}>{children}</CloudServicesProvider>
)

describe('useCloudServices', () => {
  it('returns all services when used within provider', () => {
    const { result } = renderHook(() => useCloudServices(), { wrapper })

    expect(result.current).toBe(mockServices)
  })

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useCloudServices())
    }).toThrow('useCloudServices must be used within a CloudServicesProvider')
  })
})

describe('useAuth', () => {
  it('returns auth provider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBe(mockServices.auth)
  })
})

describe('useRealtimeDatabase', () => {
  it('returns realtime database provider', () => {
    const { result } = renderHook(() => useRealtimeDatabase(), { wrapper })

    expect(result.current).toBe(mockServices.realtimeDatabase)
  })
})

describe('useFirestore', () => {
  it('returns firestore provider', () => {
    const { result } = renderHook(() => useFirestore(), { wrapper })

    expect(result.current).toBe(mockServices.firestore)
  })
})

describe('useHosting', () => {
  it('returns hosting provider', () => {
    const { result } = renderHook(() => useHosting(), { wrapper })

    expect(result.current).toBe(mockServices.hosting)
  })
})

describe('useFunctions', () => {
  it('returns functions provider', () => {
    const { result } = renderHook(() => useFunctions(), { wrapper })

    expect(result.current).toBe(mockServices.functions)
  })
})

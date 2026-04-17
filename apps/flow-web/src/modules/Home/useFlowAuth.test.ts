import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FlowAuthStatus } from './Home.types'

const mockSignInAnonymously = vi.fn()
const mockGet = vi.fn()
const mockSet = vi.fn()
const mockSetDoc = vi.fn()

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => ({
    signInAnonymously: mockSignInAnonymously,
  }),
  useRealtimeDatabase: () => ({
    get: mockGet,
    set: mockSet,
    update: vi.fn(),
    remove: vi.fn(),
    push: vi.fn(),
    onValue: vi.fn(),
  }),
  useFirestore: () => ({
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: mockSetDoc,
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  }),
}))

vi.mock('@/services/student', () => ({
  getStudentCredential: (...args: unknown[]) => {
    const realtimeDb = args[0] as { get: typeof mockGet }
    const id = args[1] as string
    return realtimeDb.get(`student-credentials/${id}`)
  },
  createStudentCredential: (...args: unknown[]) => {
    const realtimeDb = args[0] as { set: typeof mockSet }
    const id = args[1] as string
    const pwd = args[2] as string
    const uid = args[3] as string
    return realtimeDb.set(`student-credentials/${id}`, { password: pwd, uid })
  },
  createStudentProfile: (...args: unknown[]) => {
    const firestore = args[0] as { setDoc: typeof mockSetDoc }
    const uid = args[1] as string
    const data = args[2] as Record<string, unknown>
    return firestore.setDoc('students', uid, data)
  },
  hashPassword: (password: string) => Promise.resolve(`hashed_${password}`),
}))

const originalLocation = window.location

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  })
})

import { useFlowAuth } from './useFlowAuth'

describe('useFlowAuth', () => {
  it('starts in idle status', () => {
    const { result } = renderHook(() => useFlowAuth())

    expect(result.current.status).toBe(FlowAuthStatus.Idle)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.showBanner).toBe(false)
    expect(result.current.authError).toBeNull()
  })

  describe('onLogin', () => {
    it('shows banner when student does not exist', async () => {
      mockGet.mockResolvedValue(null)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '99999999', password: 'test1234' })
      })

      expect(result.current.showBanner).toBe(true)
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('sets wrongPassword error when password does not match', async () => {
      mockGet.mockResolvedValue({ password: 'hashed_different', uid: 'uid-1' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(result.current.authError).toBe('wrongPassword')
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('redirects to learning on successful login', async () => {
      mockGet.mockResolvedValue({ password: 'hashed_test1234', uid: 'uid-1' })
      mockSignInAnonymously.mockResolvedValue({ uid: 'anon-uid' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(mockSignInAnonymously).toHaveBeenCalledOnce()
      expect(window.location.href).toContain('learning')
    })

    it('sets unknown error on unexpected failure', async () => {
      mockGet.mockRejectedValue(new Error('network error'))

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(result.current.authError).toBe('unknown')
    })
  })

  describe('onRegister', () => {
    it('sets identificationAlreadyExists error when student already exists', async () => {
      mockGet.mockResolvedValue({ password: 'existing', uid: 'uid-1' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane',
          password: 'test1234',
        })
      })

      expect(result.current.authError).toBe('identificationAlreadyExists')
    })

    it('creates student and redirects on successful registration', async () => {
      mockGet.mockResolvedValue(null)
      mockSignInAnonymously.mockResolvedValue({ uid: 'new-uid' })
      mockSet.mockResolvedValue(undefined)
      mockSetDoc.mockResolvedValue(undefined)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane Doe',
          password: 'test1234',
        })
      })

      expect(mockSignInAnonymously).toHaveBeenCalledOnce()
      expect(mockSet).toHaveBeenCalledWith('student-credentials/12345678', {
        password: 'hashed_test1234',
        uid: 'new-uid',
      })
      expect(mockSetDoc).toHaveBeenCalledWith('students', 'new-uid', {
        identificationNumber: '12345678',
        name: 'Jane Doe',
      })
      expect(window.location.href).toContain('learning')
    })

    it('sets registrationFailed error on unexpected failure', async () => {
      mockGet.mockResolvedValue(null)
      mockSignInAnonymously.mockRejectedValue(new Error('auth failure'))

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane',
          password: 'test1234',
        })
      })

      expect(result.current.authError).toBe('registrationFailed')
    })
  })

  describe('dismissBanner', () => {
    it('hides the banner', async () => {
      mockGet.mockResolvedValue(null)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '99999999', password: 'test1234' })
      })

      expect(result.current.showBanner).toBe(true)

      act(() => {
        result.current.dismissBanner()
      })

      expect(result.current.showBanner).toBe(false)
    })
  })
})

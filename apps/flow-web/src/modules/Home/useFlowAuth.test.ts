import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FlowAuthStatus, FlowAuthError } from './Home.types'

const mockSignInAnonymously = vi.fn()
const mockGetCredentialMutateAsync = vi.fn()
const mockCreateCredentialMutateAsync = vi.fn()
const mockCreateProfileMutateAsync = vi.fn()
const mockUpdateUidMutateAsync = vi.fn()

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => ({
    signInAnonymously: mockSignInAnonymously,
  }),
}))

vi.mock('@/services/student', () => ({
  useGetStudentCredential: () => ({ mutateAsync: mockGetCredentialMutateAsync }),
  useCreateStudentCredential: () => ({ mutateAsync: mockCreateCredentialMutateAsync }),
  useCreateStudentProfile: () => ({ mutateAsync: mockCreateProfileMutateAsync }),
  useUpdateStudentUid: () => ({ mutateAsync: mockUpdateUidMutateAsync }),
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
      mockGetCredentialMutateAsync.mockResolvedValue(null)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '99999999', password: 'test1234' })
      })

      expect(result.current.showBanner).toBe(true)
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('sets wrongPassword error when password does not match', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue({ password: 'hashed_different', uid: 'uid-1' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(result.current.authError).toBe(FlowAuthError.WrongPassword)
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('redirects to learning and updates uid on successful login', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue({ password: 'hashed_test1234', uid: 'uid-1' })
      mockSignInAnonymously.mockResolvedValue({ uid: 'anon-uid' })
      mockUpdateUidMutateAsync.mockResolvedValue(undefined)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(mockSignInAnonymously).toHaveBeenCalledOnce()
      expect(mockUpdateUidMutateAsync).toHaveBeenCalledWith({
        identificationNumber: '12345678',
        uid: 'anon-uid',
      })
      expect(window.location.href).toContain('learning')
    })

    it('sets unknown error on unexpected failure', async () => {
      mockGetCredentialMutateAsync.mockRejectedValue(new Error('network error'))

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(result.current.authError).toBe(FlowAuthError.Unknown)
    })
  })

  describe('onRegister', () => {
    it('sets identificationAlreadyExists error when student already exists', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue({ password: 'existing', uid: 'uid-1' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane',
          password: 'test1234',
        })
      })

      expect(result.current.authError).toBe(FlowAuthError.IdentificationAlreadyExists)
    })

    it('creates student and redirects on successful registration', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue(null)
      mockSignInAnonymously.mockResolvedValue({ uid: 'new-uid' })
      mockCreateCredentialMutateAsync.mockResolvedValue(undefined)
      mockCreateProfileMutateAsync.mockResolvedValue(undefined)

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane Doe',
          password: 'test1234',
        })
      })

      expect(mockSignInAnonymously).toHaveBeenCalledOnce()
      expect(mockCreateCredentialMutateAsync).toHaveBeenCalledWith({
        identificationNumber: '12345678',
        hashedPassword: 'hashed_test1234',
        uid: 'new-uid',
      })
      expect(mockCreateProfileMutateAsync).toHaveBeenCalledWith({
        uid: 'new-uid',
        data: {
          identificationNumber: '12345678',
          name: 'Jane Doe',
        },
      })
      expect(window.location.href).toContain('learning')
    })

    it('sets registrationFailed error on unexpected failure', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue(null)
      mockSignInAnonymously.mockRejectedValue(new Error('auth failure'))

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane',
          password: 'test1234',
        })
      })

      expect(result.current.authError).toBe(FlowAuthError.RegistrationFailed)
    })
  })

  describe('dismissBanner', () => {
    it('hides the banner', async () => {
      mockGetCredentialMutateAsync.mockResolvedValue(null)

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

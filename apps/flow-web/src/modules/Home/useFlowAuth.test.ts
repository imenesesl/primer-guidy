import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as CloudServicesModule from '@primer-guidy/cloud-services'
import { FunctionsError, FunctionsErrorCode } from '@primer-guidy/cloud-services'
import { FlowAuthStatus, FlowAuthError } from './Home.types'

const mockSignInWithCustomToken = vi.fn()
const mockLoginMutateAsync = vi.fn()
const mockRegisterMutateAsync = vi.fn()

vi.mock('@primer-guidy/cloud-services', async (importOriginal) => {
  const original = await importOriginal<typeof CloudServicesModule>()
  return {
    ...original,
    useAuth: () => ({
      signInWithCustomToken: mockSignInWithCustomToken,
    }),
  }
})

vi.mock('@/services/student-auth', () => ({
  useStudentLogin: () => ({ mutateAsync: mockLoginMutateAsync }),
  useStudentRegister: () => ({ mutateAsync: mockRegisterMutateAsync }),
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
    it('shows banner when student is not found', async () => {
      mockLoginMutateAsync.mockRejectedValue(
        new FunctionsError(FunctionsErrorCode.NOT_FOUND, 'student-not-found'),
      )

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '99999999', password: 'test1234' })
      })

      expect(result.current.showBanner).toBe(true)
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('sets wrongPassword error when password is incorrect', async () => {
      mockLoginMutateAsync.mockRejectedValue(
        new FunctionsError(FunctionsErrorCode.UNAUTHENTICATED, 'wrong-password'),
      )

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'wrong1234' })
      })

      expect(result.current.authError).toBe(FlowAuthError.WrongPassword)
      expect(result.current.status).toBe(FlowAuthStatus.Idle)
    })

    it('signs in with custom token and redirects on success', async () => {
      mockLoginMutateAsync.mockResolvedValue({ token: 'custom-token-123' })
      mockSignInWithCustomToken.mockResolvedValue({ uid: 'uid-1' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(mockLoginMutateAsync).toHaveBeenCalledWith({
        identificationNumber: '12345678',
        password: 'test1234',
      })
      expect(mockSignInWithCustomToken).toHaveBeenCalledWith('custom-token-123')
      expect(window.location.href).toContain('learning')
    })

    it('sets unknown error on unexpected failure', async () => {
      mockLoginMutateAsync.mockRejectedValue(new Error('network error'))

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onLogin({ identificationNumber: '12345678', password: 'test1234' })
      })

      expect(result.current.authError).toBe(FlowAuthError.Unknown)
    })
  })

  describe('onRegister', () => {
    it('sets identificationAlreadyExists error when student already exists', async () => {
      mockRegisterMutateAsync.mockRejectedValue(
        new FunctionsError(FunctionsErrorCode.ALREADY_EXISTS, 'student-already-exists'),
      )

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

    it('registers and redirects on success', async () => {
      mockRegisterMutateAsync.mockResolvedValue({ token: 'new-token-456' })
      mockSignInWithCustomToken.mockResolvedValue({ uid: 'new-uid' })

      const { result } = renderHook(() => useFlowAuth())

      await act(async () => {
        await result.current.onRegister({
          identificationNumber: '12345678',
          name: 'Jane Doe',
          password: 'test1234',
        })
      })

      expect(mockRegisterMutateAsync).toHaveBeenCalledWith({
        identificationNumber: '12345678',
        password: 'test1234',
        name: 'Jane Doe',
      })
      expect(mockSignInWithCustomToken).toHaveBeenCalledWith('new-token-456')
      expect(window.location.href).toContain('learning')
    })

    it('sets registrationFailed error on unexpected failure', async () => {
      mockRegisterMutateAsync.mockRejectedValue(new Error('network error'))

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
      mockLoginMutateAsync.mockRejectedValue(
        new FunctionsError(FunctionsErrorCode.NOT_FOUND, 'student-not-found'),
      )

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

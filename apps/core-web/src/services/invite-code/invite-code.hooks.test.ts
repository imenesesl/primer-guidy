import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockSetQueryData = vi.fn()

const mockRtdb = { get: vi.fn(), set: vi.fn() }
const mockFunctions = { call: vi.fn() }

vi.mock('@primer-guidy/cloud-services', () => ({
  useRealtimeDatabase: () => mockRtdb,
  useFunctions: () => mockFunctions,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
}))

vi.mock('./invite-code.service', () => ({
  getExistingInviteCode: vi.fn(),
  generateAndSaveInviteCode: vi.fn(),
}))

import { useInviteCode, useGenerateInviteCode } from './invite-code.hooks'
import { getExistingInviteCode, generateAndSaveInviteCode } from './invite-code.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useInviteCode', () => {
  it('passes correct queryKey and enables when uid is provided', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useInviteCode('user-1'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['invite-code', 'user-1'],
        enabled: true,
      }),
    )
  })

  it('disables query when uid is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useInviteCode(null))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('calls getExistingInviteCode with rtdb and uid in queryFn', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useInviteCode('user-1'))

    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getExistingInviteCode).toHaveBeenCalledWith(mockRtdb, 'user-1')
  })
})

describe('useGenerateInviteCode', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useGenerateInviteCode())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls generateAndSaveInviteCode in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useGenerateInviteCode())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (uid: string) => Promise<string>
    }
    await config.mutationFn('user-1')
    expect(generateAndSaveInviteCode).toHaveBeenCalledWith(mockFunctions)
  })

  it('sets query data on success', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useGenerateInviteCode())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      onSuccess: (code: string, uid: string) => void
    }
    config.onSuccess('ABC123', 'user-1')
    expect(mockSetQueryData).toHaveBeenCalledWith(['invite-code', 'user-1'], 'ABC123')
  })
})

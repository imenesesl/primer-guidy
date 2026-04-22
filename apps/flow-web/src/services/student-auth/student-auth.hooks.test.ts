import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseMutation = vi.fn()
const mockUseFunctions = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

vi.mock('@primer-guidy/cloud-services', () => ({
  useFunctions: () => mockUseFunctions(),
}))

vi.mock('./student-auth.service', () => ({
  studentLogin: vi.fn(),
  studentRegister: vi.fn(),
}))

import { useStudentLogin, useStudentRegister } from './student-auth.hooks'

beforeEach(() => {
  vi.clearAllMocks()
  mockUseFunctions.mockReturnValue({ call: vi.fn() })
  mockUseMutation.mockReturnValue({ mutate: vi.fn() })
})

describe('useStudentLogin', () => {
  it('creates a mutation wrapping studentLogin', () => {
    renderHook(() => useStudentLogin())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})

describe('useStudentRegister', () => {
  it('creates a mutation wrapping studentRegister', () => {
    renderHook(() => useStudentRegister())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})

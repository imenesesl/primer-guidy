import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

vi.mock('./generator.service', () => ({
  generateContent: vi.fn(),
}))

import { useGenerateContent } from './generator.hooks'
import { generateContent } from './generator.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useGenerateContent', () => {
  it('creates a mutation with generateContent as mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useGenerateContent())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: generateContent }),
    )
  })
})

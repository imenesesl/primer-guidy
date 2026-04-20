import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'
import { GenerationController } from './generation.controller'
import type { GenerationService } from './generation.service'

const mockGenerate = vi.fn<() => Promise<GenerationResponseDto>>()

const mockService = {
  generate: mockGenerate,
} as unknown as GenerationService

describe('GenerationController', () => {
  let controller: GenerationController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new GenerationController(mockService)
  })

  it('calls service.generate with prompt and context from DTO', async () => {
    mockGenerate.mockResolvedValueOnce({
      content: 'generated content',
      model: 'llama-3.1',
      tokensUsed: 42,
    })

    await controller.generate({ prompt: 'explain closures', context: 'JavaScript fundamentals' })

    expect(mockGenerate).toHaveBeenCalledOnce()
    expect(mockGenerate).toHaveBeenCalledWith('explain closures', 'JavaScript fundamentals')
  })

  it('returns the generation result', async () => {
    const expected: GenerationResponseDto = {
      content: 'detailed explanation',
      model: 'llama-3.1-70b',
      tokensUsed: 128,
    }
    mockGenerate.mockResolvedValueOnce(expected)

    const result = await controller.generate({ prompt: 'explain closures', context: 'JavaScript' })

    expect(result).toEqual(expected)
  })
})

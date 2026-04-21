import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { ChatRole } from '@primer-guidy/llm-services'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { ChatController } from './chat.controller'
import type { ChatService } from './chat.service'

const mockGenerate = vi.fn()
const mockService = { generate: mockGenerate } as unknown as ChatService

describe('ChatController', () => {
  let controller: ChatController
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    collector = new MetricsCollector()
    controller = new ChatController(mockService, collector)
  })

  it('delegates to ChatService and returns result with metrics', async () => {
    mockGenerate.mockResolvedValueOnce({ reply: 'hello', model: 'llama3' })

    const result = await controller.chat({
      prompt: 'explain closures',
      context: 'JavaScript',
    })

    expect(mockGenerate).toHaveBeenCalledOnce()
    expect(result['reply']).toBe('hello')
    expect(result['metrics']).toBeDefined()
  })

  it('passes history when provided', async () => {
    mockGenerate.mockResolvedValueOnce({ reply: 'ok', model: 'llama3' })

    await controller.chat({
      prompt: 'what next?',
      context: 'math',
      history: [{ role: ChatRole.User, content: 'hi' }],
    })

    const call = mockGenerate.mock.calls[0][0]
    expect(call.history).toEqual([{ role: ChatRole.User, content: 'hi' }])
  })

  it('passes injected collector to service', async () => {
    mockGenerate.mockResolvedValueOnce({ reply: 'ok', model: 'llama3' })

    await controller.chat({ prompt: 'p', context: 'c' })

    expect(mockGenerate).toHaveBeenCalledWith(expect.any(Object), collector)
  })
})

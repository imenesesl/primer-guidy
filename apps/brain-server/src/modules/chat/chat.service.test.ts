import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { ChatRole } from '@primer-guidy/llm-services'
import type { ILlmProvider, CompletionResult } from '@primer-guidy/llm-services'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { MetricsStep } from '../../constants'
import { ChatService } from './chat.service'

const mockComplete = vi.fn<() => Promise<CompletionResult>>()
const mockProvider: ILlmProvider = { complete: mockComplete }

const MOCK_RESULT: CompletionResult = {
  content: 'Good question! What do you think about...',
  model: 'llama3.1:8b',
  usage: { promptTokens: 100, completionTokens: 80, totalTokens: 180 },
  durationMs: 500,
}

describe('ChatService', () => {
  let service: ChatService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ChatService(mockProvider)
    collector = new MetricsCollector()
  })

  it('returns reply and model', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_RESULT)

    const result = await service.generate(
      { prompt: 'explain closures', context: 'JavaScript' },
      collector,
    )

    expect(result.reply).toBe('Good question! What do you think about...')
    expect(result.model).toBe('llama3.1:8b')
  })

  it('includes system prompt with context', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_RESULT)

    await service.generate({ prompt: 'hello', context: 'math' }, collector)

    const messages = mockComplete.mock.calls[0][0]
    expect(messages[0].role).toBe(ChatRole.System)
    expect(messages[0].content).toContain('math')
    expect(messages[0].content).toContain('Socratic')
  })

  it('includes history messages between system and user', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_RESULT)

    await service.generate(
      {
        prompt: 'what next?',
        context: 'math',
        history: [
          { role: ChatRole.User, content: 'hi' },
          { role: ChatRole.Assistant, content: 'hello' },
        ],
      },
      collector,
    )

    const messages = mockComplete.mock.calls[0][0]
    expect(messages).toHaveLength(4)
    expect(messages[1]).toEqual({ role: ChatRole.User, content: 'hi' })
    expect(messages[2]).toEqual({ role: ChatRole.Assistant, content: 'hello' })
    expect(messages[3]).toEqual({ role: ChatRole.User, content: 'what next?' })
  })

  it('records chat step in metrics collector', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_RESULT)

    await service.generate({ prompt: 'hello', context: 'math' }, collector)

    const metrics = collector.build()
    expect(metrics.steps[MetricsStep.Chat]).toBeDefined()
    expect(metrics.steps[MetricsStep.Chat].totalTokens).toBe(180)
  })

  it('uses temperature 0.4 and maxTokens 512', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_RESULT)

    await service.generate({ prompt: 'hello', context: 'math' }, collector)

    const opts = mockComplete.mock.calls[0][1]
    expect(opts).toEqual({ temperature: 0.4, maxTokens: 512 })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpException } from '@nestjs/common'
import { BrainClientService } from './brain-client.service'
import { MetricsCollector } from '@primer-guidy/nest-shared'

const mockFetch = vi.fn()

describe('BrainClientService', () => {
  let service: BrainClientService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    process.env['BRAIN_BASE_URL'] = 'http://test-brain:3011'
    process.env['BRAIN_API_KEY'] = 'test-key-123'
    vi.stubGlobal('fetch', mockFetch)
    service = new BrainClientService()
    collector = new MetricsCollector()
  })

  it('calls chat endpoint with correct URL, headers and body', async () => {
    const responseBody = {
      reply: 'generated',
      model: 'llama',
      metrics: {
        steps: {
          chat: { durationMs: 100, promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        },
        totalDurationMs: 100,
        totalTokens: 30,
      },
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseBody),
    })

    const request = { prompt: 'curated prompt', context: 'math' }
    const result = await service.chat(request, collector)

    expect(mockFetch).toHaveBeenCalledWith('http://test-brain:3011/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key-123',
      },
      body: JSON.stringify(request),
    })
    expect(result).toEqual(responseBody)
  })

  it('calls quiz endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ guide: {}, studentContents: [], model: 'm' }),
    })

    await service.quiz({ prompt: 'p', context: 'c', students: ['STU-001', 'STU-002'] }, collector)

    expect(mockFetch.mock.calls[0][0]).toBe('http://test-brain:3011/api/task/quiz')
  })

  it('calls homework endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ guide: {}, studentContents: [], model: 'm' }),
    })

    await service.homework(
      { prompt: 'p', context: 'c', students: ['STU-001', 'STU-002'], questionCount: 3 },
      collector,
    )

    expect(mockFetch.mock.calls[0][0]).toBe('http://test-brain:3011/api/task/homework')
  })

  it('propagates brain metrics steps to collector', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          reply: 'ok',
          model: 'm',
          metrics: {
            steps: {
              chat: { durationMs: 200, promptTokens: 15, completionTokens: 25, totalTokens: 40 },
            },
            totalDurationMs: 200,
            totalTokens: 40,
          },
        }),
    })

    await service.chat({ prompt: 'p', context: 'c' }, collector)

    const metrics = collector.build()
    expect(metrics.steps['brain.chat']).toBeDefined()
    expect(metrics.steps['brain.chat'].totalTokens).toBe(40)
  })

  it('adds generic brain step when no steps in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: 'ok', model: 'm' }),
    })

    await service.chat({ prompt: 'p', context: 'c' }, collector)

    const metrics = collector.build()
    expect(metrics.steps['brain']).toBeDefined()
  })

  it('throws HttpException on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    await expect(service.chat({ prompt: 'p', context: 'c' }, collector)).rejects.toThrow(
      HttpException,
    )
  })

  it('throws HttpException when fetch fails (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    await expect(service.chat({ prompt: 'p', context: 'c' }, collector)).rejects.toThrow(
      HttpException,
    )
  })
})

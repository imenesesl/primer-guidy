import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpException } from '@nestjs/common'
import { BrainClientService } from './brain-client.service'

const mockFetch = vi.fn()

describe('BrainClientService', () => {
  let service: BrainClientService

  beforeEach(() => {
    vi.clearAllMocks()
    process.env['BRAIN_BASE_URL'] = 'http://test-brain:3011'
    process.env['BRAIN_API_KEY'] = 'test-key-123'
    vi.stubGlobal('fetch', mockFetch)
    service = new BrainClientService()
  })

  it('calls brain API with correct URL, headers and body', async () => {
    const responseBody = { content: 'generated', model: 'llama', tokensUsed: 42 }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseBody),
    })

    const result = await service.generate('curated prompt', 'math')

    expect(mockFetch).toHaveBeenCalledWith('http://test-brain:3011/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key-123',
      },
      body: JSON.stringify({ prompt: 'curated prompt', context: 'math' }),
    })
    expect(result).toEqual(responseBody)
  })

  it('sends X-API-Key header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ content: '', model: '', tokensUsed: 0 }),
    })

    await service.generate('p', 'c')

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['X-API-Key']).toBe('test-key-123')
  })

  it('throws HttpException on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    await expect(service.generate('p', 'c')).rejects.toThrow(HttpException)

    const error = await service.generate('p', 'c').catch((e: HttpException) => e)
    expect(error).toBeInstanceOf(HttpException)
    expect(error.getStatus()).toBe(500)
  })

  it('throws HttpException when fetch fails (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    await expect(service.generate('p', 'c')).rejects.toThrow(HttpException)
  })
})

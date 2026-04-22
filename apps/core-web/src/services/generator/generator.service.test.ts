import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateContent } from './generator.service'
import type { TaskGeneratorRequest } from './generator.types'

const mockRequest: TaskGeneratorRequest = {
  type: 'task-generator',
  task: 'quiz',
  prompt: 'Create a math quiz',
  context: 'Algebra basics',
  students: ['student-1'],
  questionCount: 5,
  openQuestion: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

describe('generateContent', () => {
  it('calls fetch with correct URL and headers', async () => {
    const json = { valid: true }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    } as Response)

    await generateContent({ request: mockRequest, authToken: 'tok-123', channelId: 'ch-1' })

    expect(fetch).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(fetch).mock.calls[0] as [string | URL, RequestInit | undefined]
    const [url, opts] = callArgs
    expect(String(url)).toContain('/api/process')
    expect(String(url)).toContain('channelId=ch-1')
    expect(opts?.method).toBe('POST')
    expect((opts?.headers as Record<string, string>)['Authorization']).toBe('Bearer tok-123')
    expect((opts?.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('returns parsed JSON on success', async () => {
    const json = { valid: true, model: 'gpt-4' }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    } as Response)

    const result = await generateContent({ request: mockRequest })
    expect(result).toEqual(json)
  })

  it('throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    } as Response)

    await expect(generateContent({ request: mockRequest })).rejects.toThrow(
      'Guardian API error (500): Internal Server Error',
    )
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendChat } from './guardian.service'
import { ChatRole } from './guardian.types'

const MOCK_RESPONSE = { reply: 'Hello student!', model: 'gpt-4' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

describe('sendChat', () => {
  it('sends a POST request with correct headers and body', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    } as Response)

    await sendChat({
      prompt: 'What is a variable?',
      context: 'JavaScript basics',
      history: [{ role: ChatRole.User, content: 'Hi' }],
      authToken: 'token-123',
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/process'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        }),
        body: expect.any(String),
      }),
    )

    const callArgs = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((callArgs?.[1]?.body ?? '{}') as string)
    expect(body).toEqual({
      type: 'chat',
      prompt: 'What is a variable?',
      context: 'JavaScript basics',
      history: [{ role: ChatRole.User, content: 'Hi' }],
    })
  })

  it('returns the parsed response on success', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    } as Response)

    const result = await sendChat({
      prompt: 'test',
      context: 'ctx',
      authToken: 'token',
    })

    expect(result).toEqual(MOCK_RESPONSE)
  })

  it('throws on non-ok response with status and error text', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    } as Response)

    await expect(
      sendChat({ prompt: 'test', context: 'ctx', authToken: 'bad-token' }),
    ).rejects.toThrow('Guardian API error (401): Unauthorized')
  })

  it('handles text() failure gracefully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('stream error')),
    } as Response)

    await expect(sendChat({ prompt: 'test', context: 'ctx', authToken: 'token' })).rejects.toThrow(
      'Guardian API error (500): Unknown error',
    )
  })
})

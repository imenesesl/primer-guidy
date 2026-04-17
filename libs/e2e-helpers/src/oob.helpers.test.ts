import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOobCodeForEmail, buildEmailLinkUrl } from './oob.helpers'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', mockFetch)
})

describe('getOobCodeForEmail', () => {
  it('returns the last matching OOB code for the given email', async () => {
    const oobCodes = [
      { email: 'user@test.com', requestType: 'EMAIL_SIGNIN', oobCode: 'code-1', oobLink: 'link-1' },
      {
        email: 'other@test.com',
        requestType: 'EMAIL_SIGNIN',
        oobCode: 'code-2',
        oobLink: 'link-2',
      },
      { email: 'user@test.com', requestType: 'EMAIL_SIGNIN', oobCode: 'code-3', oobLink: 'link-3' },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ oobCodes }),
    })

    const result = await getOobCodeForEmail('user@test.com')

    expect(result).toEqual({
      email: 'user@test.com',
      requestType: 'EMAIL_SIGNIN',
      oobCode: 'code-3',
      oobLink: 'link-3',
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:9099/emulator/v1/projects/guidy-app-ai/oobCodes',
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    })

    await expect(getOobCodeForEmail('user@test.com')).rejects.toThrow(
      'Failed to fetch OOB codes: Internal Server Error',
    )
  })

  it('throws when no code is found for the email', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ oobCodes: [] }),
    })

    await expect(getOobCodeForEmail('missing@test.com')).rejects.toThrow(
      'No OOB code found for email: missing@test.com',
    )
  })
})

describe('buildEmailLinkUrl', () => {
  it('appends query params with ? when no existing query params', () => {
    const result = buildEmailLinkUrl('http://localhost:3000/auth', 'abc123')

    expect(result).toBe(
      'http://localhost:3000/auth?mode=signIn&oobCode=abc123&apiKey=fake-api-key&lang=en',
    )
  })

  it('appends query params with & when path already has query params', () => {
    const result = buildEmailLinkUrl('http://localhost:3000/auth?existing=true', 'abc123')

    expect(result).toBe(
      'http://localhost:3000/auth?existing=true&mode=signIn&oobCode=abc123&apiKey=fake-api-key&lang=en',
    )
  })
})

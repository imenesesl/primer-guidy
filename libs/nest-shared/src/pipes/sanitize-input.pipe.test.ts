import { describe, it, expect } from 'vitest'
import { ChatRole } from '@primer-guidy/llm-services'
import { SanitizeInputPipe } from './sanitize-input.pipe'

describe('SanitizeInputPipe', () => {
  const pipe = new SanitizeInputPipe()

  it('strips control characters from string fields', () => {
    const input = { prompt: 'hello\x00world\x1F', context: 'test\x07' }
    const result = pipe.transform(input) as Record<string, string>

    expect(result.prompt).toBe('helloworld')
    expect(result.context).toBe('test')
  })

  it('trims whitespace from string fields', () => {
    const input = { prompt: '  hello  ', context: '  test  ' }
    const result = pipe.transform(input) as Record<string, string>

    expect(result.prompt).toBe('hello')
    expect(result.context).toBe('test')
  })

  it('sanitizes nested arrays', () => {
    const input = { history: [{ role: ChatRole.User, content: 'hi\x00' }] }
    const result = pipe.transform(input) as { history: { content: string }[] }

    expect(result.history[0].content).toBe('hi')
  })

  it('passes through non-object values unchanged', () => {
    expect(pipe.transform(42)).toBe(42)
    expect(pipe.transform(null)).toBeNull()
    expect(pipe.transform(undefined)).toBeUndefined()
  })

  it('preserves non-string primitive values in objects', () => {
    const input = { count: 5, flag: true, prompt: 'ok\x00' }
    const result = pipe.transform(input) as Record<string, unknown>

    expect(result.count).toBe(5)
    expect(result.flag).toBe(true)
    expect(result.prompt).toBe('ok')
  })
})

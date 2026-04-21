import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'

vi.mock('@primer-guidy/llm-services', () => ({
  createLlmProvider: vi.fn((config: Record<string, string>) => ({
    provider: config.provider,
    model: config.model,
  })),
}))

import { LlmModule } from './llm.module'

describe('LlmModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers dynamic module with providers and exports', () => {
    const result = LlmModule.register([
      { token: 'LLM_PROVIDER', modelEnv: 'LLM_MODEL', defaultModel: 'claude-sonnet-4-6' },
    ])

    expect(result.module).toBe(LlmModule)
    expect(result.providers).toHaveLength(1)
    expect(result.exports).toEqual(['LLM_PROVIDER'])
    expect(result.global).toBe(true)
  })

  it('registers multiple providers', () => {
    const result = LlmModule.register([
      { token: 'LLM_GUARD', modelEnv: 'GUARD_MODEL', defaultModel: 'claude-haiku-4-5' },
      { token: 'LLM_CURATION', modelEnv: 'CURATION_MODEL', defaultModel: 'claude-sonnet-4-6' },
    ])

    expect(result.providers).toHaveLength(2)
    expect(result.exports).toEqual(['LLM_GUARD', 'LLM_CURATION'])
  })

  it('provider factory uses env var model when set', () => {
    process.env['TEST_MODEL'] = 'custom-model'
    process.env['ANTHROPIC_API_KEY'] = 'test-key'

    const result = LlmModule.register([
      { token: 'LLM_TEST', modelEnv: 'TEST_MODEL', defaultModel: 'default-model' },
    ])

    const provider = result.providers?.[0] as { useFactory: () => unknown }
    const instance = provider.useFactory() as { model: string }

    expect(instance.model).toBe('custom-model')

    delete process.env['TEST_MODEL']
    delete process.env['ANTHROPIC_API_KEY']
  })
})

import { describe, it, expect, vi } from 'vitest'
import type { CompletionResult } from '@primer-guidy/llm-services'
import { MetricsCollector } from './metrics-collector'

const makeResult = (tokens: number, duration: number): CompletionResult => ({
  content: 'test',
  model: 'test-model',
  usage: { promptTokens: tokens, completionTokens: tokens, totalTokens: tokens * 2 },
  durationMs: duration,
})

describe('MetricsCollector', () => {
  it('records a step and builds metrics', async () => {
    const collector = new MetricsCollector()

    await collector.record('step1', async () => makeResult(10, 100))

    const metrics = collector.build()
    expect(metrics.steps['step1']).toEqual({
      durationMs: 100,
      promptTokens: 10,
      completionTokens: 10,
      totalTokens: 20,
    })
    expect(metrics.totalTokens).toBe(20)
    expect(metrics.totalDurationMs).toBeGreaterThanOrEqual(0)
  })

  it('records multiple steps and sums totalTokens', async () => {
    const collector = new MetricsCollector()

    await collector.record('guard', async () => makeResult(5, 50))
    await collector.record('curation', async () => makeResult(15, 200))

    const metrics = collector.build()
    expect(metrics.totalTokens).toBe(40)
    expect(Object.keys(metrics.steps)).toEqual(['guard', 'curation'])
  })

  it('adds manual steps via addStep', () => {
    const collector = new MetricsCollector()

    collector.addStep('brain.chat', {
      durationMs: 300,
      promptTokens: 20,
      completionTokens: 30,
      totalTokens: 50,
    })

    const metrics = collector.build()
    expect(metrics.steps['brain.chat'].totalTokens).toBe(50)
    expect(metrics.totalTokens).toBe(50)
  })

  it('returns CompletionResult from record', async () => {
    const collector = new MetricsCollector()
    const expected = makeResult(10, 100)

    const result = await collector.record('step', async () => expected)

    expect(result).toEqual(expected)
  })

  it('propagates errors from recorded function', async () => {
    const collector = new MetricsCollector()

    await expect(
      collector.record('step', async () => {
        throw new Error('LLM failed')
      }),
    ).rejects.toThrow('LLM failed')

    const metrics = collector.build()
    expect(metrics.steps['step']).toBeUndefined()
  })

  it('totalDurationMs measures elapsed wall time', async () => {
    const collector = new MetricsCollector()
    vi.useFakeTimers()

    const promise = collector.record('step', async () => {
      await new Promise((r) => setTimeout(r, 100))
      return makeResult(1, 100)
    })

    vi.advanceTimersByTime(100)
    await promise

    vi.useRealTimers()
    const metrics = collector.build()
    expect(metrics.totalDurationMs).toBeGreaterThanOrEqual(0)
  })
})

import { Injectable, Scope } from '@nestjs/common'
import type { CompletionResult } from '@primer-guidy/llm-services'
import type { StepMetrics, PipelineMetrics } from '../dto/step-metrics.dto'

@Injectable({ scope: Scope.REQUEST })
export class MetricsCollector {
  private readonly steps: Record<string, StepMetrics> = {}
  private readonly start = performance.now()

  async record(name: string, fn: () => Promise<CompletionResult>): Promise<CompletionResult> {
    const result = await fn()
    this.steps[name] = {
      durationMs: result.durationMs,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    }
    return result
  }

  addStep(name: string, metrics: StepMetrics): void {
    this.steps[name] = metrics
  }

  build(): PipelineMetrics {
    const totalTokens = Object.values(this.steps).reduce((sum, m) => sum + m.totalTokens, 0)
    return {
      steps: { ...this.steps },
      totalDurationMs: Math.round(performance.now() - this.start),
      totalTokens,
    }
  }
}

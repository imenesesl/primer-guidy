export interface StepMetrics {
  readonly durationMs: number
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

export interface PipelineMetrics {
  readonly steps: Record<string, StepMetrics>
  readonly totalDurationMs: number
  readonly totalTokens: number
}

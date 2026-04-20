import type { PipelineMetrics, StepMetrics } from './step-metrics.dto'

export interface QuestionDto {
  readonly id: string
  readonly statement: string
  readonly options?: string[]
  readonly correctIndex?: number
  readonly explanation?: string
  readonly expectedAnswerHints?: string[]
}

export interface StudentContentDto {
  readonly identificationNumber: string
  readonly questions: QuestionDto[]
  readonly chatContext: string
  readonly metrics: StepMetrics
}

export interface ChatProcessResponse {
  readonly type: 'chat'
  readonly valid: true
  readonly reply: string
  readonly model: string
  readonly metrics: PipelineMetrics
}

export interface TaskProcessResponse {
  readonly type: 'task-generator'
  readonly task: 'quiz' | 'homework'
  readonly valid: true
  readonly guide: Record<string, unknown>
  readonly studentContents: StudentContentDto[]
  readonly model: string
  readonly metrics: PipelineMetrics
}

export interface ValidationFailResponse {
  readonly type: string
  readonly valid: false
  readonly error: {
    readonly reason: string
    readonly message: string
    readonly step: string
  }
  readonly metrics: PipelineMetrics
}

export type ProcessResponse = ChatProcessResponse | TaskProcessResponse | ValidationFailResponse

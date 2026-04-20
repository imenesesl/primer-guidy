import type { ProcessType, TaskKind } from './generator.schema'

export interface TaskGeneratorRequest {
  readonly type: typeof ProcessType.TaskGenerator
  readonly task: (typeof TaskKind)[keyof typeof TaskKind]
  readonly prompt: string
  readonly context: string
  readonly students: readonly string[]
  readonly questionCount?: number
  readonly openQuestion?: boolean
}

export interface QuestionResponse {
  readonly id: string
  readonly statement: string
  readonly options?: string[]
  readonly correctIndex?: number
  readonly explanation?: string
  readonly expectedAnswerHints?: string[]
}

export interface StudentContentResponse {
  readonly identificationNumber: string
  readonly questions: QuestionResponse[]
  readonly chatContext: string
}

export interface TaskGeneratorSuccessResponse {
  readonly type: typeof ProcessType.TaskGenerator
  readonly task: (typeof TaskKind)[keyof typeof TaskKind]
  readonly valid: true
  readonly guide: Record<string, unknown>
  readonly studentContents: StudentContentResponse[]
  readonly model: string
}

export interface ValidationFailResponse {
  readonly valid: false
  readonly error: {
    readonly reason: string
    readonly message: string
    readonly step: string
  }
}

export type TaskGeneratorResponse = TaskGeneratorSuccessResponse | ValidationFailResponse

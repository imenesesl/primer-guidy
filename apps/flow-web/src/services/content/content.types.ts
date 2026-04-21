export interface QuestionData {
  readonly id: string
  readonly statement: string
  readonly options?: string[]
  readonly correctIndex?: number
  readonly explanation?: string
  readonly expectedAnswerHints?: string[]
}

export interface StudentContentData {
  readonly questions: QuestionData[]
  readonly chatContext: string
}

export interface ContentData {
  readonly type: string
  readonly task: 'quiz' | 'homework'
  readonly valid: boolean
  readonly guide: Record<string, unknown>
  readonly model: string
  readonly createdAt: string
}

export interface ContentDocument extends ContentData {
  readonly id: string
}

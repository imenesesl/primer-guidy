export const QUIZZES_COLLECTION = 'quizzes' as const
export const HOMEWORK_COLLECTION = 'homework' as const

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
  readonly completed: boolean
  readonly answered: boolean
  readonly selectedIndex: number | null
  readonly previousSelectedIndex: number | null
}

export interface ContentData {
  readonly type: 'task-generator'
  readonly task: 'quiz' | 'homework'
  readonly valid: boolean
  readonly guide: Record<string, unknown>
  readonly model: string
  readonly createdAt: string
}

export interface ContentDocument extends ContentData {
  readonly id: string
}

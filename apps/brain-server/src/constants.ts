export enum MetricsStep {
  Guide = 'guide',
  Chat = 'chat',
}

export const studentStep = (identificationNumber: string): string =>
  `student.${identificationNumber}`

export const BrainRoute = {
  Chat: 'api/chat',
  Quiz: 'api/task/quiz',
  Homework: 'api/task/homework',
} as const

export const TemplatePlaceholder = {
  StudentIndex: '{{STUDENT_INDEX}}',
  QuestionCount: '{{QUESTION_COUNT}}',
  Language: '{{LANGUAGE}}',
} as const

export const DEFAULT_LANGUAGE = 'es'

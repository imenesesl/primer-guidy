export enum MetricsStep {
  Guide = 'guide',
  Chat = 'chat',
}

export const studentStep = (index: number): string => `student.${index}`

export enum BrainError {
  JsonParseFailed = 'Failed to parse JSON from LLM at step',
  SchemaValidationFailed = 'LLM output failed schema validation at step',
  EmptyResponse = 'Anthropic returned empty response',
}

export const BrainRoute = {
  Chat: 'api/chat',
  Quiz: 'api/task/quiz',
  Homework: 'api/task/homework',
} as const

export const TemplatePlaceholder = {
  StudentIndex: '{{STUDENT_INDEX}}',
  QuestionCount: '{{QUESTION_COUNT}}',
} as const

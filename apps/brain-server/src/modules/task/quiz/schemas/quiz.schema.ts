import { z } from 'zod'

const MIN_STATEMENT_LENGTH = 10
const OPTIONS_COUNT = 4
const MAX_CORRECT_INDEX = 3
const QUIZ_QUESTION_COUNT = 1
const MIN_CHAT_CONTEXT_LENGTH = 20

export const QuizQuestionSchema = z.object({
  id: z.string(),
  statement: z.string().min(MIN_STATEMENT_LENGTH),
  options: z.array(z.string()).length(OPTIONS_COUNT),
  correctIndex: z.number().int().min(0).max(MAX_CORRECT_INDEX),
  explanation: z.string(),
})

export const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).length(QUIZ_QUESTION_COUNT),
  chatContext: z.string().min(MIN_CHAT_CONTEXT_LENGTH),
})

export type QuizContent = z.infer<typeof QuizSchema>

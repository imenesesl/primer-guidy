import { z } from 'zod'

const MIN_STATEMENT_LENGTH = 10
const OPTIONS_COUNT = 4
const MAX_CORRECT_INDEX = 3
const MAX_QUESTIONS = 20
const MIN_CHAT_CONTEXT_LENGTH = 20

export const HomeworkMultipleChoiceQuestionSchema = z.object({
  id: z.string(),
  statement: z.string().min(MIN_STATEMENT_LENGTH),
  options: z.array(z.string()).length(OPTIONS_COUNT),
  correctIndex: z.number().int().min(0).max(MAX_CORRECT_INDEX),
  explanation: z.string(),
})

export const HomeworkOpenQuestionSchema = z.object({
  id: z.string(),
  statement: z.string().min(MIN_STATEMENT_LENGTH),
  expectedAnswerHints: z.array(z.string()).min(1),
})

export const HomeworkMultipleChoiceSchema = z.object({
  questions: z.array(HomeworkMultipleChoiceQuestionSchema).min(1).max(MAX_QUESTIONS),
  chatContext: z.string().min(MIN_CHAT_CONTEXT_LENGTH),
})

export const HomeworkOpenSchema = z.object({
  questions: z.array(HomeworkOpenQuestionSchema).min(1).max(MAX_QUESTIONS),
  chatContext: z.string().min(MIN_CHAT_CONTEXT_LENGTH),
})

export type HomeworkMultipleChoiceContent = z.infer<typeof HomeworkMultipleChoiceSchema>
export type HomeworkOpenContent = z.infer<typeof HomeworkOpenSchema>

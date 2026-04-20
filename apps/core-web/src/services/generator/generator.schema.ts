import * as v from 'valibot'

export const MAX_PROMPT_LENGTH = 2000
export const MAX_CONTEXT_LENGTH = 4000
export const MAX_QUESTION_COUNT = 20

export const ProcessType = {
  TaskGenerator: 'task-generator',
} as const

export const TASK_KINDS = ['quiz', 'homework'] as const

export const TaskKind = {
  Quiz: 'quiz',
  Homework: 'homework',
} as const satisfies Record<string, (typeof TASK_KINDS)[number]>

export const GeneratorSchema = v.object({
  task: v.picklist(TASK_KINDS),
  prompt: v.pipe(v.string(), v.nonEmpty('required'), v.maxLength(MAX_PROMPT_LENGTH, 'maxLength')),
  context: v.pipe(v.string(), v.nonEmpty('required'), v.maxLength(MAX_CONTEXT_LENGTH, 'maxLength')),
  questionCount: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1, 'minValue'),
    v.maxValue(MAX_QUESTION_COUNT, 'maxValue'),
  ),
  openQuestion: v.boolean(),
})

export type GeneratorFormData = v.InferOutput<typeof GeneratorSchema>

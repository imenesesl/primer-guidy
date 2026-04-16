import * as v from 'valibot'

export const EmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export type EmailFormData = v.InferOutput<typeof EmailSchema>

const MIN_NAME_LENGTH = 2

export const CreateAccountSchema = v.object({
  name: v.pipe(v.string(), v.minLength(MIN_NAME_LENGTH)),
  email: v.pipe(v.string(), v.email()),
})

export type CreateAccountFormData = v.InferOutput<typeof CreateAccountSchema>

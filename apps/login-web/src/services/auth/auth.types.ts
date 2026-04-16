import * as v from 'valibot'

export const EmailSchema = v.object({
  email: v.pipe(v.string(), v.email()),
})

export type EmailFormData = v.InferOutput<typeof EmailSchema>

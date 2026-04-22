import * as v from 'valibot'

export const CreateChannelSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.regex(/^[a-zA-Z0-9-]+$/)),
})

export type CreateChannelFormData = v.InferOutput<typeof CreateChannelSchema>

export interface ChannelData {
  readonly name: string
  readonly active: boolean
  readonly students: readonly string[]
}

export interface ChannelDocument extends ChannelData {
  readonly id: string
}

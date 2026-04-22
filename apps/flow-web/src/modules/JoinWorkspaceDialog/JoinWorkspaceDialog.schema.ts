import * as v from 'valibot'
import { CODE_LENGTH } from './JoinWorkspaceDialog.constants'

export const JoinWorkspaceSchema = v.object({
  code: v.pipe(v.string(), v.length(CODE_LENGTH, 'invalidLength')),
})

export type JoinWorkspaceFormData = v.InferOutput<typeof JoinWorkspaceSchema>

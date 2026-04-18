import { useMutation } from '@tanstack/react-query'
import { useRealtimeDatabase, useFirestore } from '@primer-guidy/cloud-services'
import { lookupInviteCode, joinWorkspace } from './workspace.service'
import { WorkspaceErrorCode } from './workspace.types'

interface JoinWorkspaceArgs {
  readonly code: string
  readonly name: string
  readonly identificationNumber: string
}

export const useJoinWorkspace = () => {
  const rtdb = useRealtimeDatabase()
  const firestore = useFirestore()

  return useMutation({
    mutationFn: async ({ code, name, identificationNumber }: JoinWorkspaceArgs) => {
      const teacherUid = await lookupInviteCode(rtdb, code)
      if (!teacherUid) {
        throw new Error(WorkspaceErrorCode.INVALID_CODE)
      }
      await joinWorkspace(firestore, teacherUid, name, identificationNumber)
    },
  })
}

import { useMutation, useQuery } from '@tanstack/react-query'
import { useRealtimeDatabase, useFirestore } from '@primer-guidy/cloud-services'
import { lookupInviteCode, joinWorkspace, getStudentWorkspaces } from './workspace.service'
import { WorkspaceErrorCode } from './workspace.types'
import type { WorkspaceEntry } from './workspace.types'

const STUDENT_WORKSPACES_KEY = 'student-workspaces' as const

export const useStudentWorkspaces = (identificationNumber: string | null) => {
  const firestore = useFirestore()
  return useQuery<WorkspaceEntry[]>({
    queryKey: [STUDENT_WORKSPACES_KEY, identificationNumber],
    queryFn: () => getStudentWorkspaces(firestore, identificationNumber as string),
    enabled: identificationNumber !== null,
  })
}

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRealtimeDatabase } from '@primer-guidy/cloud-services'
import { getExistingInviteCode, generateAndSaveInviteCode } from './invite-code.service'

const INVITE_CODE_KEY = 'invite-code' as const

export const useInviteCode = (uid: string | null) => {
  const rtdb = useRealtimeDatabase()
  return useQuery<string | null>({
    queryKey: [INVITE_CODE_KEY, uid],
    queryFn: () => getExistingInviteCode(rtdb, uid as string),
    enabled: uid !== null,
  })
}

export const useGenerateInviteCode = () => {
  const rtdb = useRealtimeDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uid: string) => generateAndSaveInviteCode(rtdb, uid),
    onSuccess: (code, uid) => {
      queryClient.setQueryData([INVITE_CODE_KEY, uid], code)
    },
  })
}

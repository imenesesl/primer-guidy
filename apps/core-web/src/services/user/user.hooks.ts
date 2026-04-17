import { useQuery } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { getUserProfile } from './user.service'
import type { UserDocument } from './user.types'

const USER_PROFILE_KEY = 'user-profile' as const

export const useUserProfile = (uid: string | null) => {
  const firestore = useFirestore()
  return useQuery<UserDocument | null>({
    queryKey: [USER_PROFILE_KEY, uid],
    queryFn: () => getUserProfile(firestore, uid ?? ''),
    enabled: uid !== null,
  })
}

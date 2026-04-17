import { useMutation } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { checkUserExists, createUser } from './user.service'
import type { CreateUserData } from './user.types'

export const useCheckUserExists = () => {
  const firestore = useFirestore()
  return useMutation({
    mutationFn: (uid: string) => checkUserExists(firestore, uid),
  })
}

interface CreateUserArgs {
  readonly uid: string
  readonly data: CreateUserData
}

export const useCreateUser = () => {
  const firestore = useFirestore()
  return useMutation({
    mutationFn: ({ uid, data }: CreateUserArgs) => createUser(firestore, uid, data),
  })
}

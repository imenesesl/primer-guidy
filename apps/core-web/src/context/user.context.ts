import { createContext, useContext } from 'react'
import type { UserDocument } from '@/services/user'

export const UserContext = createContext<UserDocument | null>(null)

export const UserProvider = UserContext.Provider

export const useCurrentUser = (): UserDocument => {
  const user = useContext(UserContext)
  if (!user) {
    throw new Error('useCurrentUser must be used within a UserProvider')
  }
  return user
}

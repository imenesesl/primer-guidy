import type { IRealtimeDatabaseProvider } from '@primer-guidy/cloud-services'
import type { InviteCodeEntry } from './invite-code.types'
import { generateCodeFromUid } from './invite-code.utils'

const CODES_PATH = 'codes'
const USER_CODES_PATH = 'userCodes'
const MAX_ATTEMPTS = 50

export const getExistingInviteCode = async (
  rtdb: IRealtimeDatabaseProvider,
  uid: string,
): Promise<string | null> => rtdb.get<string>(`${USER_CODES_PATH}/${uid}`)

export const generateAndSaveInviteCode = async (
  rtdb: IRealtimeDatabaseProvider,
  uid: string,
): Promise<string> => {
  const existing = await getExistingInviteCode(rtdb, uid)
  if (existing) return existing

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCodeFromUid(uid, attempt)
    const entry = await rtdb.get<InviteCodeEntry>(`${CODES_PATH}/${code}`)

    if (!entry) {
      await rtdb.set<InviteCodeEntry>(`${CODES_PATH}/${code}`, { uid })
      await rtdb.set<string>(`${USER_CODES_PATH}/${uid}`, code)
      return code
    }

    if (entry.uid === uid) {
      await rtdb.set<string>(`${USER_CODES_PATH}/${uid}`, code)
      return code
    }
  }

  throw new Error('Failed to generate a unique invite code after maximum attempts')
}

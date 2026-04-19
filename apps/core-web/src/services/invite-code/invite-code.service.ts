import type { IRealtimeDatabaseProvider, IFunctionsProvider } from '@primer-guidy/cloud-services'
import type { GenerateInviteCodeResult } from './invite-code.types'

const USER_CODES_PATH = 'userCodes'
const FUNCTION_NAME = 'generateInviteCode'

export const getExistingInviteCode = async (
  rtdb: IRealtimeDatabaseProvider,
  uid: string,
): Promise<string | null> => rtdb.get<string>(`${USER_CODES_PATH}/${uid}`)

export const generateAndSaveInviteCode = async (functions: IFunctionsProvider): Promise<string> => {
  const result = await functions.call<GenerateInviteCodeResult>(FUNCTION_NAME, {})
  return result.code
}

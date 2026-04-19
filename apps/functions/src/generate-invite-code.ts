import { randomInt } from 'node:crypto'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { ErrorCode, ErrorMessage } from './errors'
import { CODES_PATH, USER_CODES_PATH } from './constants'
import type { GenerateInviteCodeResponse, InviteCodeEntry } from './types'

const CODE_MAX = 10_000_000_000
const CODE_LENGTH = 10
const MAX_ATTEMPTS = 50

const generateRandomCode = (): string =>
  randomInt(0, CODE_MAX).toString().padStart(CODE_LENGTH, '0')

export const generateInviteCode = onCall<undefined, Promise<GenerateInviteCodeResponse>>(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(ErrorCode.Unauthenticated, ErrorMessage.Unauthenticated)
    }

    const uid = request.auth.uid
    const db = getDatabase()

    const existingSnapshot = await db.ref(`${USER_CODES_PATH}/${uid}`).get()
    if (existingSnapshot.exists()) {
      return { code: existingSnapshot.val() as string }
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = generateRandomCode()
      const entry = await db.ref(`${CODES_PATH}/${code}`).get()

      if (!entry.exists()) {
        await db.ref(`${CODES_PATH}/${code}`).set({ uid } satisfies InviteCodeEntry)
        await db.ref(`${USER_CODES_PATH}/${uid}`).set(code)
        return { code }
      }
    }

    throw new HttpsError(ErrorCode.Unavailable, ErrorMessage.CodeGenerationFailed)
  },
)

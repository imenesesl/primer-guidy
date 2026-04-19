import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import argon2 from 'argon2'
import { ErrorCode, ErrorMessage } from './errors'
import { STUDENTS_RTDB_PATH, STUDENTS_COLLECTION } from './constants'
import type { StudentRegisterRequest, StudentAuthResponse } from './types'

export const studentRegister = onCall<StudentRegisterRequest, Promise<StudentAuthResponse>>(
  async (request) => {
    const { identificationNumber, password, name } = request.data

    if (!identificationNumber || !password || !name) {
      throw new HttpsError(ErrorCode.InvalidArgument, ErrorMessage.MissingFields)
    }

    const db = getDatabase()
    const existing = await db.ref(`${STUDENTS_RTDB_PATH}/${identificationNumber}`).get()

    if (existing.exists()) {
      throw new HttpsError(ErrorCode.AlreadyExists, ErrorMessage.StudentAlreadyExists)
    }

    const authUser = await getAuth().createUser({})
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id })

    await db.ref(`${STUDENTS_RTDB_PATH}/${identificationNumber}`).set({
      password: hashedPassword,
      uid: authUser.uid,
    })

    await getFirestore().collection(STUDENTS_COLLECTION).doc(identificationNumber).set({
      uid: authUser.uid,
      identificationNumber,
      name,
      createdAt: new Date().toISOString(),
    })

    const token = await getAuth().createCustomToken(authUser.uid)
    return { token }
  },
)

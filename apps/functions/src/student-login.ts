import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'
import argon2 from 'argon2'
import { ErrorCode, ErrorMessage } from './errors'
import { STUDENTS_RTDB_PATH } from './constants'
import type { StudentCredential, StudentLoginRequest, StudentAuthResponse } from './types'

export const studentLogin = onCall<StudentLoginRequest, Promise<StudentAuthResponse>>(
  async (request) => {
    const { identificationNumber, password } = request.data

    if (!identificationNumber || !password) {
      throw new HttpsError(ErrorCode.InvalidArgument, ErrorMessage.MissingFields)
    }

    const snapshot = await getDatabase().ref(`${STUDENTS_RTDB_PATH}/${identificationNumber}`).get()

    if (!snapshot.exists()) {
      throw new HttpsError(ErrorCode.NotFound, ErrorMessage.StudentNotFound)
    }

    const credential = snapshot.val() as StudentCredential

    const isValid = await argon2.verify(credential.password, password)
    if (!isValid) {
      throw new HttpsError(ErrorCode.Unauthenticated, ErrorMessage.WrongPassword)
    }

    const token = await getAuth().createCustomToken(credential.uid)
    return { token }
  },
)

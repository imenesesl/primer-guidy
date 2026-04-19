import type { FunctionsErrorCode } from 'firebase-functions/v2/https'

export const ErrorCode = {
  InvalidArgument: 'invalid-argument' as FunctionsErrorCode,
  NotFound: 'not-found' as FunctionsErrorCode,
  Unauthenticated: 'unauthenticated' as FunctionsErrorCode,
  AlreadyExists: 'already-exists' as FunctionsErrorCode,
  Unavailable: 'unavailable' as FunctionsErrorCode,
} as const

export const ErrorMessage = {
  MissingFields: 'missing-fields',
  StudentNotFound: 'student-not-found',
  WrongPassword: 'wrong-password',
  StudentAlreadyExists: 'student-already-exists',
  Unauthenticated: 'unauthenticated',
  CodeGenerationFailed: 'code-generation-failed',
} as const

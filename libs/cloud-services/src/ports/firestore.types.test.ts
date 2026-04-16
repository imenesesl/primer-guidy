import { describe, it, expect } from 'vitest'
import { FirestoreError, FirestoreErrorCode } from './firestore.types'

describe('FirestoreError', () => {
  it('creates error with code and message', () => {
    const error = new FirestoreError(FirestoreErrorCode.NOT_FOUND, 'Document not found')

    expect(error.code).toBe(FirestoreErrorCode.NOT_FOUND)
    expect(error.message).toBe('Document not found')
    expect(error.name).toBe('FirestoreError')
  })

  it('is an instance of Error', () => {
    const error = new FirestoreError(FirestoreErrorCode.UNKNOWN, 'Something went wrong')

    expect(error).toBeInstanceOf(Error)
  })
})

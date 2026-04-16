import { describe, it, expect } from 'vitest'
import { DatabaseError, DatabaseErrorCode } from './realtime-database.types'

describe('DatabaseError', () => {
  it('creates error with code and message', () => {
    const error = new DatabaseError(DatabaseErrorCode.PERMISSION_DENIED, 'Access denied')

    expect(error.code).toBe(DatabaseErrorCode.PERMISSION_DENIED)
    expect(error.message).toBe('Access denied')
    expect(error.name).toBe('DatabaseError')
  })

  it('is an instance of Error', () => {
    const error = new DatabaseError(DatabaseErrorCode.UNKNOWN, 'Something went wrong')

    expect(error).toBeInstanceOf(Error)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DatabaseError, DatabaseErrorCode } from '../../ports/realtime-database.types'

const mockDb = Symbol('mockDb')
const mockRef = Symbol('mockRef')

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => mockDb),
  ref: vi.fn(() => mockRef),
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onValue: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

const database = await import('firebase/database')
const { FirebaseRealtimeDatabaseAdapter } = await import('./realtime-database.adapter')

interface TestData {
  name: string
  value: number
}

describe('FirebaseRealtimeDatabaseAdapter', () => {
  let adapter: InstanceType<typeof FirebaseRealtimeDatabaseAdapter>

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new FirebaseRealtimeDatabaseAdapter({} as never)
  })

  describe('get', () => {
    it('returns data when snapshot exists', async () => {
      vi.mocked(database.get).mockResolvedValue({
        exists: () => true,
        val: () => ({ name: 'Alice', value: 42 }),
      } as never)

      const result = await adapter.get<TestData>('users/1')

      expect(result).toEqual({ name: 'Alice', value: 42 })
      expect(database.ref).toHaveBeenCalledWith(mockDb, 'users/1')
    })

    it('returns null when snapshot does not exist', async () => {
      vi.mocked(database.get).mockResolvedValue({
        exists: () => false,
        val: () => null,
      } as never)

      const result = await adapter.get<TestData>('users/missing')

      expect(result).toBeNull()
    })

    it('throws mapped DatabaseError on failure', async () => {
      vi.mocked(database.get).mockRejectedValue({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
      })

      await expect(adapter.get('users/1')).rejects.toMatchObject({
        code: DatabaseErrorCode.PERMISSION_DENIED,
      })
    })

    it('throws UNKNOWN for unrecognized error codes', async () => {
      vi.mocked(database.get).mockRejectedValue({
        code: 'SOMETHING_ELSE',
        message: 'Unexpected',
      })

      await expect(adapter.get('path')).rejects.toMatchObject({
        code: DatabaseErrorCode.UNKNOWN,
      })
    })
  })

  describe('set', () => {
    it('sets data at the given path', async () => {
      vi.mocked(database.set).mockResolvedValue(undefined)

      await adapter.set('users/1', { name: 'Alice', value: 42 })

      expect(database.ref).toHaveBeenCalledWith(mockDb, 'users/1')
      expect(database.set).toHaveBeenCalledWith(mockRef, { name: 'Alice', value: 42 })
    })

    it('throws mapped DatabaseError on failure', async () => {
      vi.mocked(database.set).mockRejectedValue({
        code: 'PERMISSION_DENIED',
        message: 'Denied',
      })

      await expect(adapter.set('path', {})).rejects.toThrow(DatabaseError)
    })
  })

  describe('update', () => {
    it('updates data at the given path', async () => {
      vi.mocked(database.update).mockResolvedValue(undefined)

      await adapter.update('users/1', { name: 'Updated' })

      expect(database.ref).toHaveBeenCalledWith(mockDb, 'users/1')
      expect(database.update).toHaveBeenCalledWith(mockRef, { name: 'Updated' })
    })

    it('throws mapped DatabaseError on failure', async () => {
      vi.mocked(database.update).mockRejectedValue({
        code: 'DISCONNECTED',
        message: 'Disconnected',
      })

      await expect(adapter.update('path', {})).rejects.toMatchObject({
        code: DatabaseErrorCode.DISCONNECTED,
      })
    })
  })

  describe('remove', () => {
    it('removes data at the given path', async () => {
      vi.mocked(database.remove).mockResolvedValue(undefined)

      await adapter.remove('users/1')

      expect(database.ref).toHaveBeenCalledWith(mockDb, 'users/1')
      expect(database.remove).toHaveBeenCalledWith(mockRef)
    })

    it('throws mapped DatabaseError on failure', async () => {
      vi.mocked(database.remove).mockRejectedValue({
        message: 'Error',
      })

      await expect(adapter.remove('path')).rejects.toMatchObject({
        code: DatabaseErrorCode.UNKNOWN,
      })
    })
  })

  describe('push', () => {
    it('pushes data and returns the generated key', async () => {
      const mockNewRef = { key: 'auto-key-123' }
      vi.mocked(database.push).mockReturnValue(mockNewRef as never)
      vi.mocked(database.set).mockResolvedValue(undefined)

      const key = await adapter.push('messages', { name: 'Hello', value: 1 })

      expect(key).toBe('auto-key-123')
      expect(database.push).toHaveBeenCalledWith(mockRef)
      expect(database.set).toHaveBeenCalledWith(mockNewRef, { name: 'Hello', value: 1 })
    })

    it('throws DatabaseError when key is null', async () => {
      vi.mocked(database.push).mockReturnValue({ key: null } as never)
      vi.mocked(database.set).mockResolvedValue(undefined)

      await expect(adapter.push('messages', { name: 'X', value: 0 })).rejects.toMatchObject({
        code: DatabaseErrorCode.UNKNOWN,
        message: 'Failed to generate key',
      })
    })

    it('throws mapped DatabaseError on set failure', async () => {
      vi.mocked(database.push).mockReturnValue({ key: 'key' } as never)
      vi.mocked(database.set).mockRejectedValue({
        code: 'PERMISSION_DENIED',
        message: 'Denied',
      })

      await expect(adapter.push('messages', {})).rejects.toMatchObject({
        code: DatabaseErrorCode.PERMISSION_DENIED,
      })
    })
  })

  describe('onValue', () => {
    it('subscribes and invokes callback with data when snapshot exists', () => {
      const mockUnsubscribe = vi.fn()
      vi.mocked(database.onValue).mockImplementation((_ref, callback) => {
        ;(callback as (snapshot: unknown) => void)({
          exists: () => true,
          val: () => ({ name: 'Live', value: 99 }),
        })
        return mockUnsubscribe
      })

      const callback = vi.fn()
      const unsubscribe = adapter.onValue<TestData>('data/live', callback)

      expect(callback).toHaveBeenCalledWith({ name: 'Live', value: 99 })
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('invokes callback with null when snapshot does not exist', () => {
      vi.mocked(database.onValue).mockImplementation((_ref, callback) => {
        ;(callback as (snapshot: unknown) => void)({
          exists: () => false,
          val: () => null,
        })
        return vi.fn()
      })

      const callback = vi.fn()
      adapter.onValue('data/missing', callback)

      expect(callback).toHaveBeenCalledWith(null)
    })
  })
})

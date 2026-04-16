import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FirestoreError, FirestoreErrorCode } from '../../ports/firestore.types'
import type { QueryOptions } from '../../ports/firestore.types'

const mockDb = Symbol('mockDb')
const mockDocRef = Symbol('mockDocRef')
const mockCollRef = Symbol('mockCollRef')
const mockQuery = Symbol('mockQuery')

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  doc: vi.fn(() => mockDocRef),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(() => mockCollRef),
  query: vi.fn(() => mockQuery),
  where: vi.fn((...args: unknown[]) => ({ type: 'where', args })),
  orderBy: vi.fn((...args: unknown[]) => ({ type: 'orderBy', args })),
  limit: vi.fn((n: unknown) => ({ type: 'limit', n })),
  onSnapshot: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

const firestore = await import('firebase/firestore')
const { FirebaseFirestoreAdapter } = await import('./firestore.adapter')

interface TestDoc {
  id: string
  name: string
}

describe('FirebaseFirestoreAdapter', () => {
  let adapter: InstanceType<typeof FirebaseFirestoreAdapter>

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new FirebaseFirestoreAdapter({} as never)
  })

  describe('getDoc', () => {
    it('returns document data with id when it exists', async () => {
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => true,
        id: 'doc-1',
        data: () => ({ name: 'Alice' }),
      } as never)

      const result = await adapter.getDoc<TestDoc>('users', 'doc-1')

      expect(result).toEqual({ id: 'doc-1', name: 'Alice' })
      expect(firestore.doc).toHaveBeenCalledWith(mockDb, 'users', 'doc-1')
    })

    it('returns null when document does not exist', async () => {
      vi.mocked(firestore.getDoc).mockResolvedValue({
        exists: () => false,
      } as never)

      const result = await adapter.getDoc<TestDoc>('users', 'missing')

      expect(result).toBeNull()
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.getDoc).mockRejectedValue({
        code: 'permission-denied',
        message: 'Denied',
      })

      await expect(adapter.getDoc('users', 'doc-1')).rejects.toMatchObject({
        code: FirestoreErrorCode.PERMISSION_DENIED,
      })
    })
  })

  describe('getDocs', () => {
    it('returns array of documents with ids', async () => {
      vi.mocked(firestore.getDocs).mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ name: 'Alice' }) },
          { id: '2', data: () => ({ name: 'Bob' }) },
        ],
      } as never)

      const result = await adapter.getDocs<TestDoc>('users')

      expect(result).toEqual([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ])
    })

    it('applies query options (filters, orderBy, limit)', async () => {
      vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as never)

      const options: QueryOptions = {
        filters: [{ field: 'active', operator: '==', value: true }],
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 10,
      }

      await adapter.getDocs('users', options)

      expect(firestore.where).toHaveBeenCalledWith('active', '==', true)
      expect(firestore.orderBy).toHaveBeenCalledWith('name', 'asc')
      expect(firestore.limit).toHaveBeenCalledWith(10)
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue({
        code: 'not-found',
        message: 'Not found',
      })

      await expect(adapter.getDocs('users')).rejects.toMatchObject({
        code: FirestoreErrorCode.NOT_FOUND,
      })
    })
  })

  describe('setDoc', () => {
    it('sets document data at the given path', async () => {
      vi.mocked(firestore.setDoc).mockResolvedValue(undefined)

      await adapter.setDoc('users', 'doc-1', { name: 'Alice' })

      expect(firestore.doc).toHaveBeenCalledWith(mockDb, 'users', 'doc-1')
      expect(firestore.setDoc).toHaveBeenCalledWith(mockDocRef, { name: 'Alice' })
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.setDoc).mockRejectedValue({
        code: 'already-exists',
        message: 'Already exists',
      })

      await expect(adapter.setDoc('users', 'doc-1', { name: 'X' })).rejects.toMatchObject({
        code: FirestoreErrorCode.ALREADY_EXISTS,
      })
    })
  })

  describe('addDoc', () => {
    it('adds a document and returns the generated id', async () => {
      vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'auto-id' } as never)

      const id = await adapter.addDoc('users', { name: 'Charlie' })

      expect(id).toBe('auto-id')
      expect(firestore.collection).toHaveBeenCalledWith(mockDb, 'users')
      expect(firestore.addDoc).toHaveBeenCalledWith(mockCollRef, { name: 'Charlie' })
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.addDoc).mockRejectedValue({
        code: 'permission-denied',
        message: 'Denied',
      })

      await expect(adapter.addDoc('users', { name: 'X' })).rejects.toThrow(FirestoreError)
    })
  })

  describe('updateDoc', () => {
    it('updates document with partial data', async () => {
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined)

      await adapter.updateDoc('users', 'doc-1', { name: 'Updated' })

      expect(firestore.doc).toHaveBeenCalledWith(mockDb, 'users', 'doc-1')
      expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, { name: 'Updated' })
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.updateDoc).mockRejectedValue({
        code: 'not-found',
        message: 'Doc not found',
      })

      await expect(adapter.updateDoc('users', 'doc-1', {})).rejects.toMatchObject({
        code: FirestoreErrorCode.NOT_FOUND,
      })
    })
  })

  describe('deleteDoc', () => {
    it('deletes the document at the given path', async () => {
      vi.mocked(firestore.deleteDoc).mockResolvedValue(undefined)

      await adapter.deleteDoc('users', 'doc-1')

      expect(firestore.doc).toHaveBeenCalledWith(mockDb, 'users', 'doc-1')
      expect(firestore.deleteDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('throws mapped FirestoreError on failure', async () => {
      vi.mocked(firestore.deleteDoc).mockRejectedValue({
        message: 'Unknown error',
      })

      await expect(adapter.deleteDoc('users', 'doc-1')).rejects.toMatchObject({
        code: FirestoreErrorCode.UNKNOWN,
      })
    })
  })

  describe('onSnapshot', () => {
    it('subscribes and invokes callback with mapped docs', () => {
      const mockUnsubscribe = vi.fn()
      vi.mocked(firestore.onSnapshot).mockImplementation((_q, callback) => {
        ;(callback as (snapshot: unknown) => void)({
          docs: [
            { id: '1', data: () => ({ name: 'Alice' }) },
            { id: '2', data: () => ({ name: 'Bob' }) },
          ],
        })
        return mockUnsubscribe
      })

      const callback = vi.fn()
      const unsubscribe = adapter.onSnapshot<TestDoc>('users', callback)

      expect(callback).toHaveBeenCalledWith([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ])
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('passes query options to buildQuery', () => {
      vi.mocked(firestore.onSnapshot).mockReturnValue(vi.fn())

      const options: QueryOptions = {
        filters: [{ field: 'status', operator: '==', value: 'active' }],
      }

      adapter.onSnapshot('users', vi.fn(), options)

      expect(firestore.where).toHaveBeenCalledWith('status', '==', 'active')
    })
  })
})

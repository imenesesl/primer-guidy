import { describe, it, expect, vi } from 'vitest'
import type { IRealtimeDatabaseProvider, IFirestoreProvider } from '@primer-guidy/cloud-services'
import {
  checkStudentExists,
  getStudentCredential,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'

const mockRealtimeDb: IRealtimeDatabaseProvider = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onValue: vi.fn(),
}

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

describe('checkStudentExists', () => {
  it('returns true when student credential exists', async () => {
    vi.mocked(mockRealtimeDb.get).mockResolvedValue({ password: 'hash', uid: 'uid-1' })

    const result = await checkStudentExists(mockRealtimeDb, '12345678')

    expect(result).toBe(true)
    expect(mockRealtimeDb.get).toHaveBeenCalledWith('student-credentials/12345678')
  })

  it('returns false when student credential does not exist', async () => {
    vi.mocked(mockRealtimeDb.get).mockResolvedValue(null)

    const result = await checkStudentExists(mockRealtimeDb, '99999999')

    expect(result).toBe(false)
  })
})

describe('getStudentCredential', () => {
  it('returns credential when it exists', async () => {
    const credential = { password: 'hashedpw', uid: 'uid-1' }
    vi.mocked(mockRealtimeDb.get).mockResolvedValue(credential)

    const result = await getStudentCredential(mockRealtimeDb, '12345678')

    expect(result).toEqual(credential)
    expect(mockRealtimeDb.get).toHaveBeenCalledWith('student-credentials/12345678')
  })

  it('returns null when credential does not exist', async () => {
    vi.mocked(mockRealtimeDb.get).mockResolvedValue(null)

    const result = await getStudentCredential(mockRealtimeDb, '99999999')

    expect(result).toBeNull()
  })
})

describe('createStudentCredential', () => {
  it('writes credential to realtime database', async () => {
    vi.mocked(mockRealtimeDb.set).mockResolvedValue(undefined)

    await createStudentCredential(mockRealtimeDb, '12345678', 'hashedpw', 'uid-1')

    expect(mockRealtimeDb.set).toHaveBeenCalledWith('student-credentials/12345678', {
      password: 'hashedpw',
      uid: 'uid-1',
    })
  })
})

describe('createStudentProfile', () => {
  it('writes profile to firestore with identificationNumber as document id', async () => {
    vi.mocked(mockFirestore.setDoc).mockResolvedValue(undefined)

    await createStudentProfile(mockFirestore, 'uid-1', {
      identificationNumber: '12345678',
      name: 'Jane Doe',
    })

    expect(mockFirestore.setDoc).toHaveBeenCalledWith('students', '12345678', {
      uid: 'uid-1',
      identificationNumber: '12345678',
      name: 'Jane Doe',
      createdAt: expect.any(String),
    })
  })
})

describe('updateStudentUid', () => {
  it('updates uid in both realtime database and firestore', async () => {
    vi.mocked(mockRealtimeDb.update).mockResolvedValue(undefined)
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await updateStudentUid(mockRealtimeDb, mockFirestore, '12345678', 'new-uid')

    expect(mockRealtimeDb.update).toHaveBeenCalledWith('student-credentials/12345678', {
      uid: 'new-uid',
    })
    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('students', '12345678', {
      uid: 'new-uid',
    })
  })
})

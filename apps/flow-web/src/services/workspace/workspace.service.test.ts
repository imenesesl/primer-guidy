import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IRealtimeDatabaseProvider, IFirestoreProvider } from '@primer-guidy/cloud-services'
import { lookupInviteCode, joinWorkspace } from './workspace.service'
import { EnrollmentStatus, WorkspaceErrorCode } from './workspace.types'

const mockRtdb: IRealtimeDatabaseProvider = {
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('lookupInviteCode', () => {
  it('returns teacher UID when code exists', async () => {
    vi.mocked(mockRtdb.get).mockResolvedValue({ uid: 'teacher-1' })

    const result = await lookupInviteCode(mockRtdb, '1234567890')

    expect(result).toBe('teacher-1')
    expect(mockRtdb.get).toHaveBeenCalledWith('codes/1234567890')
  })

  it('returns null when code does not exist', async () => {
    vi.mocked(mockRtdb.get).mockResolvedValue(null)

    const result = await lookupInviteCode(mockRtdb, '0000000000')

    expect(result).toBeNull()
  })
})

describe('joinWorkspace', () => {
  it('creates enrollment in teacher subcollection keyed by identificationNumber', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue(null)
    vi.mocked(mockFirestore.setDoc).mockResolvedValue(undefined)

    await joinWorkspace(mockFirestore, 'teacher-1', 'Jane Doe', '12345678')

    expect(mockFirestore.setDoc).toHaveBeenCalledWith(
      'users/teacher-1/students',
      '12345678',
      expect.objectContaining({
        name: 'Jane Doe',
        identificationNumber: '12345678',
        status: EnrollmentStatus.Inactive,
        joinedAt: expect.any(String),
      }),
    )
  })

  it('throws ALREADY_ENROLLED when student already exists', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue({
      name: 'Jane Doe',
      identificationNumber: '12345678',
      status: EnrollmentStatus.Active,
      joinedAt: '2026-01-01',
    })

    await expect(joinWorkspace(mockFirestore, 'teacher-1', 'Jane Doe', '12345678')).rejects.toThrow(
      WorkspaceErrorCode.ALREADY_ENROLLED,
    )

    expect(mockFirestore.setDoc).not.toHaveBeenCalled()
  })
})

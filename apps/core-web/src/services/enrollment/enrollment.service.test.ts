import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import {
  getEnrolledStudents,
  updateEnrollmentStatus,
  syncWorkspaceEntry,
  toggleEnrollmentStatus,
} from './enrollment.service'
import { EnrollmentStatus } from './enrollment.types'

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  onSnapshotDoc: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getEnrolledStudents', () => {
  it('fetches students from the teacher subcollection', async () => {
    const students = [
      {
        name: 'Alice',
        identificationNumber: '111',
        status: EnrollmentStatus.Active,
        joinedAt: '2026-01-01',
      },
    ]
    vi.mocked(mockFirestore.getDocs).mockResolvedValue(students)

    const result = await getEnrolledStudents(mockFirestore, 'teacher-1')

    expect(result).toEqual(students)
    expect(mockFirestore.getDocs).toHaveBeenCalledWith('users/teacher-1/students')
  })
})

describe('updateEnrollmentStatus', () => {
  it('updates status using identificationNumber as document ID', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await updateEnrollmentStatus(mockFirestore, 'teacher-1', '12345678', EnrollmentStatus.Active)

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('users/teacher-1/students', '12345678', {
      status: EnrollmentStatus.Active,
    })
  })
})

describe('syncWorkspaceEntry', () => {
  it('creates workspace entry when it does not exist', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue(null)
    vi.mocked(mockFirestore.setDoc).mockResolvedValue(undefined)

    await syncWorkspaceEntry(mockFirestore, '12345678', 'teacher-1', 'Mr. Smith', true)

    expect(mockFirestore.getDoc).toHaveBeenCalledWith('students/12345678/workspaces', 'teacher-1')
    expect(mockFirestore.setDoc).toHaveBeenCalledWith('students/12345678/workspaces', 'teacher-1', {
      name: 'Mr. Smith',
      uid: 'teacher-1',
      active: true,
    })
  })

  it('updates active flag when workspace entry already exists', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue({
      name: 'Mr. Smith',
      uid: 'teacher-1',
      active: true,
    })
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await syncWorkspaceEntry(mockFirestore, '12345678', 'teacher-1', 'Mr. Smith', false)

    expect(mockFirestore.setDoc).not.toHaveBeenCalled()
    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
      'students/12345678/workspaces',
      'teacher-1',
      { active: false },
    )
  })
})

describe('toggleEnrollmentStatus', () => {
  it('syncs workspace entry then updates enrollment status', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue(null)
    vi.mocked(mockFirestore.setDoc).mockResolvedValue(undefined)
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await toggleEnrollmentStatus(
      mockFirestore,
      'teacher-1',
      'Mr. Smith',
      '12345678',
      EnrollmentStatus.Active,
    )

    expect(mockFirestore.getDoc).toHaveBeenCalledWith('students/12345678/workspaces', 'teacher-1')
    expect(mockFirestore.setDoc).toHaveBeenCalledWith('students/12345678/workspaces', 'teacher-1', {
      name: 'Mr. Smith',
      uid: 'teacher-1',
      active: true,
    })
    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('users/teacher-1/students', '12345678', {
      status: EnrollmentStatus.Active,
    })
  })

  it('sets active to false when status is Inactive', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue({
      name: 'Mr. Smith',
      uid: 'teacher-1',
      active: true,
    })
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await toggleEnrollmentStatus(
      mockFirestore,
      'teacher-1',
      'Mr. Smith',
      '12345678',
      EnrollmentStatus.Inactive,
    )

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
      'students/12345678/workspaces',
      'teacher-1',
      { active: false },
    )
    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('users/teacher-1/students', '12345678', {
      status: EnrollmentStatus.Inactive,
    })
  })
})

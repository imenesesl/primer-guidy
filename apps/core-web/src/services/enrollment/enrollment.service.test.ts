import { describe, it, expect, vi } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { getEnrolledStudents, updateEnrollmentStatus } from './enrollment.service'
import { EnrollmentStatus } from './enrollment.types'

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

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

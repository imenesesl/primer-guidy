import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EnrollmentStatus } from '@/services/enrollment'
import { useFilteredStudents } from './useFilteredStudents'

const mockStudents = [
  {
    name: 'Alice',
    identificationNumber: '111',
    status: EnrollmentStatus.Active,
    joinedAt: '2026-01-01',
  },
  {
    name: 'Bob',
    identificationNumber: '222',
    status: EnrollmentStatus.Inactive,
    joinedAt: '2026-01-02',
  },
]

describe('useFilteredStudents', () => {
  it('returns empty array when students is undefined', () => {
    const { result } = renderHook(() => useFilteredStudents(undefined, ''))
    expect(result.current).toEqual([])
  })

  it('returns all students when search is empty', () => {
    const { result } = renderHook(() => useFilteredStudents(mockStudents, ''))
    expect(result.current).toEqual(mockStudents)
  })

  it('filters by name', () => {
    const { result } = renderHook(() => useFilteredStudents(mockStudents, 'alice'))
    expect(result.current).toHaveLength(1)
    expect(result.current.at(0)?.name).toBe('Alice')
  })

  it('filters by identification number', () => {
    const { result } = renderHook(() => useFilteredStudents(mockStudents, '222'))
    expect(result.current).toHaveLength(1)
    expect(result.current.at(0)?.name).toBe('Bob')
  })

  it('returns empty array when no match', () => {
    const { result } = renderHook(() => useFilteredStudents(mockStudents, 'xyz'))
    expect(result.current).toHaveLength(0)
  })
})

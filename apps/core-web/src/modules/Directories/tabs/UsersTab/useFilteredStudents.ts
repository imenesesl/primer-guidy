import { useMemo } from 'react'
import type { StudentEnrollment } from '@/services/enrollment'

export const useFilteredStudents = (
  students: StudentEnrollment[] | undefined,
  search: string,
): StudentEnrollment[] =>
  useMemo(() => {
    if (!students) return []
    if (!search.trim()) return students
    const query = search.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.identificationNumber.toLowerCase().includes(query),
    )
  }, [students, search])

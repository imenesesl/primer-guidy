export {
  getEnrolledStudents,
  updateEnrollmentStatus,
  syncWorkspaceEntry,
  toggleEnrollmentStatus,
} from './enrollment.service'
export { useEnrolledStudents, useToggleEnrollmentStatus } from './enrollment.hooks'
export { EnrollmentStatus } from './enrollment.types'
export type { StudentEnrollment, WorkspaceEntry } from './enrollment.types'

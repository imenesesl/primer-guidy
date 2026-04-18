export {
  checkStudentExists,
  getStudentCredential,
  getStudentProfileByUid,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'
export {
  useStudentProfile,
  useGetStudentCredential,
  useCreateStudentCredential,
  useCreateStudentProfile,
  useUpdateStudentUid,
} from './student.hooks'
export { hashPassword } from './student.utils'
export type { StudentCredential, StudentProfile, CreateStudentData } from './student.types'

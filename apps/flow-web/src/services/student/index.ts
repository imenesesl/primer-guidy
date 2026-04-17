export {
  checkStudentExists,
  getStudentCredential,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'
export {
  useGetStudentCredential,
  useCreateStudentCredential,
  useCreateStudentProfile,
  useUpdateStudentUid,
} from './student.hooks'
export { hashPassword } from './student.utils'
export type { StudentCredential, StudentProfile, CreateStudentData } from './student.types'

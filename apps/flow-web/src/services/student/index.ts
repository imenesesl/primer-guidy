export {
  checkStudentExists,
  getStudentCredential,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'
export { hashPassword } from './student.utils'
export type { StudentCredential, StudentProfile, CreateStudentData } from './student.types'

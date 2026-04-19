import type { IFunctionsProvider } from '@primer-guidy/cloud-services'
import type {
  StudentLoginRequest,
  StudentRegisterRequest,
  StudentAuthResponse,
} from './student-auth.types'

export const studentLogin = async (
  functions: IFunctionsProvider,
  data: StudentLoginRequest,
): Promise<StudentAuthResponse> => functions.call<StudentAuthResponse>('studentLogin', data)

export const studentRegister = async (
  functions: IFunctionsProvider,
  data: StudentRegisterRequest,
): Promise<StudentAuthResponse> => functions.call<StudentAuthResponse>('studentRegister', data)

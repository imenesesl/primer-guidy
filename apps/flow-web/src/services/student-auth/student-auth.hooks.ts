import { useMutation } from '@tanstack/react-query'
import { useFunctions } from '@primer-guidy/cloud-services'
import { studentLogin, studentRegister } from './student-auth.service'
import type { StudentLoginRequest, StudentRegisterRequest } from './student-auth.types'

export const useStudentLogin = () => {
  const functions = useFunctions()
  return useMutation({
    mutationFn: (data: StudentLoginRequest) => studentLogin(functions, data),
  })
}

export const useStudentRegister = () => {
  const functions = useFunctions()
  return useMutation({
    mutationFn: (data: StudentRegisterRequest) => studentRegister(functions, data),
  })
}

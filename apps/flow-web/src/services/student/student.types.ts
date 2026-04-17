export interface StudentCredential {
  readonly password: string
  readonly uid: string
}

export interface StudentProfile {
  readonly uid: string
  readonly identificationNumber: string
  readonly name: string
  readonly createdAt: string
}

export interface CreateStudentData {
  readonly identificationNumber: string
  readonly name: string
}

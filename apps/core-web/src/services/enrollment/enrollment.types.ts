export enum EnrollmentStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export interface StudentEnrollment {
  readonly name: string
  readonly identificationNumber: string
  readonly status: EnrollmentStatus
  readonly joinedAt: string
}

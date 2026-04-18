export enum EnrollmentStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum WorkspaceErrorCode {
  INVALID_CODE = 'INVALID_CODE',
}

export interface StudentEnrollmentData {
  readonly name: string
  readonly identificationNumber: string
  readonly status: EnrollmentStatus
  readonly joinedAt: string
}

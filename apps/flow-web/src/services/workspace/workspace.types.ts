export enum EnrollmentStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum WorkspaceErrorCode {
  INVALID_CODE = 'INVALID_CODE',
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
}

export interface StudentEnrollmentData {
  readonly name: string
  readonly identificationNumber: string
  readonly status: EnrollmentStatus
  readonly joinedAt: string
}

export interface WorkspaceEntry {
  readonly name: string
  readonly uid: string
  readonly active: boolean
}

export interface JoinWorkspaceArgs {
  readonly code: string
  readonly name: string
  readonly identificationNumber: string
}

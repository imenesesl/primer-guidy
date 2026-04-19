export interface StudentCredential {
  readonly password: string
  readonly uid: string
}

export interface StudentLoginRequest {
  readonly identificationNumber: string
  readonly password: string
}

export interface StudentRegisterRequest {
  readonly identificationNumber: string
  readonly password: string
  readonly name: string
}

export interface StudentAuthResponse {
  readonly token: string
}

export interface GenerateInviteCodeResponse {
  readonly code: string
}

export interface InviteCodeEntry {
  readonly uid: string
}

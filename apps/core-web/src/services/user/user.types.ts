export interface UserDocument {
  readonly uid: string
  readonly name: string
  readonly email: string
  readonly avatarUrl: string | null
  readonly organization: string | null
  readonly createdAt: string
}

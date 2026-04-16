export interface UserDocument {
  readonly uid: string
  readonly email: string | null
  readonly displayName: string | null
}

export enum DatabaseErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DISCONNECTED = 'DISCONNECTED',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export class DatabaseError extends Error {
  constructor(
    public readonly code: DatabaseErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

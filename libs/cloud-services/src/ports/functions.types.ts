export enum FunctionsErrorCode {
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNAVAILABLE = 'UNAVAILABLE',
  UNKNOWN = 'UNKNOWN',
}

export class FunctionsError extends Error {
  constructor(
    public readonly code: FunctionsErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'FunctionsError'
  }
}

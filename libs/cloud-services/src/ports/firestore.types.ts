export type FilterOperator =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any'

export type SortDirection = 'asc' | 'desc'

export interface QueryFilter {
  readonly field: string
  readonly operator: FilterOperator
  readonly value: unknown
}

export interface QueryOrder {
  readonly field: string
  readonly direction: SortDirection
}

export interface QueryOptions {
  readonly filters?: readonly QueryFilter[]
  readonly orderBy?: readonly QueryOrder[]
  readonly limit?: number
}

export enum FirestoreErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  UNKNOWN = 'UNKNOWN',
}

export class FirestoreError extends Error {
  constructor(
    public readonly code: FirestoreErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'FirestoreError'
  }
}

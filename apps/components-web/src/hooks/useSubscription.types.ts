export enum AsyncStatus {
  Pending = 'pending',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

export interface SubscriptionResult<T> {
  readonly data: T | null
  readonly status: AsyncStatus
  readonly error: Error | null
  readonly isLoading: boolean
}

export interface SubscriptionOptions {
  readonly enabled?: boolean
}

export type SubscribeFn<T> = (callback: (data: T) => void) => () => void

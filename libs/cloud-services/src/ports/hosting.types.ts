export interface HostingConfig {
  readonly projectId: string
  readonly site?: string
}

export enum HostingErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  UNKNOWN = 'UNKNOWN',
}

export class HostingError extends Error {
  constructor(
    public readonly code: HostingErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'HostingError'
  }
}

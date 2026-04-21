export class InvalidProcessTypeError extends Error {
  constructor(type: string) {
    super(`type must be "chat" or "task-generator", received "${type}"`)
    this.name = 'InvalidProcessTypeError'
  }
}

export class DtoValidationError extends Error {
  readonly details: readonly string[]

  constructor(details: readonly string[]) {
    super(`Validation failed: ${details.join('; ')}`)
    this.name = 'DtoValidationError'
    this.details = details
  }
}

export class BrainUnavailableError extends Error {
  constructor() {
    super('Brain server is unavailable')
    this.name = 'BrainUnavailableError'
  }
}

export class BrainResponseError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, detail: string) {
    super(`Brain server error: ${detail}`)
    this.name = 'BrainResponseError'
    this.statusCode = statusCode
  }
}

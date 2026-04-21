export class JsonParseError extends Error {
  constructor(step: string) {
    super(`Failed to parse JSON from LLM at step "${step}"`)
    this.name = 'JsonParseError'
  }
}

export class SchemaValidationError extends Error {
  constructor(step: string, detail: string) {
    super(`LLM output failed schema validation at step "${step}": ${detail}`)
    this.name = 'SchemaValidationError'
  }
}

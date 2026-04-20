import type { PipeTransform } from '@nestjs/common'
import { Injectable } from '@nestjs/common'

// eslint-disable-next-line no-control-regex -- intentional: strips dangerous control characters from user input
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (typeof value !== 'object' || value === null) return value
    return this.sanitize(value)
  }

  private sanitize(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return obj.replace(CONTROL_CHARS, '').trim()
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item))
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(obj)) {
        result[key] = this.sanitize(val)
      }
      return result
    }
    return obj
  }
}

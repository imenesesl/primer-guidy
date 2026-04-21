import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { HttpStatus } from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import { JsonParseError, SchemaValidationError } from '../errors'
import { DomainExceptionFilter } from './domain-exception.filter'

const mockJson = vi.fn()
const mockStatus = vi.fn().mockReturnValue({ json: mockJson })
const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus })
const mockSwitchToHttp = vi.fn().mockReturnValue({ getResponse: mockGetResponse })

const mockHost = { switchToHttp: mockSwitchToHttp } as unknown as ArgumentsHost

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter

  beforeEach(() => {
    vi.clearAllMocks()
    filter = new DomainExceptionFilter()
  })

  it('responds with BAD_GATEWAY for JsonParseError', () => {
    const error = new JsonParseError('guide')

    filter.catch(error, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY)
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: error.message,
      error: 'JsonParseError',
    })
  })

  it('responds with BAD_GATEWAY for SchemaValidationError', () => {
    const error = new SchemaValidationError('student.STU-001', 'missing field')

    filter.catch(error, mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY)
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: error.message,
      error: 'SchemaValidationError',
    })
  })
})

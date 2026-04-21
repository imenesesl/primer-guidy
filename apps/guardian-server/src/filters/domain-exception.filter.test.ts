import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { HttpStatus } from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import {
  InvalidProcessTypeError,
  DtoValidationError,
  BrainUnavailableError,
  BrainResponseError,
} from '../errors'
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

  it('responds with BAD_REQUEST for InvalidProcessTypeError', () => {
    filter.catch(new InvalidProcessTypeError('bad'), mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'InvalidProcessTypeError' }),
    )
  })

  it('responds with BAD_REQUEST for DtoValidationError', () => {
    filter.catch(new DtoValidationError(['field required']), mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'DtoValidationError' }))
  })

  it('responds with SERVICE_UNAVAILABLE for BrainUnavailableError', () => {
    filter.catch(new BrainUnavailableError(), mockHost)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE)
  })

  it('responds with upstream status for BrainResponseError', () => {
    const UPSTREAM_STATUS = 502
    filter.catch(new BrainResponseError(UPSTREAM_STATUS, 'gateway error'), mockHost)

    expect(mockStatus).toHaveBeenCalledWith(UPSTREAM_STATUS)
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ error: 'BrainResponseError' }))
  })
})

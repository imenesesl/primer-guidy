import { Catch, HttpStatus } from '@nestjs/common'
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import type { Response } from 'express'
import {
  InvalidProcessTypeError,
  DtoValidationError,
  BrainUnavailableError,
  BrainResponseError,
} from '../errors'

type DomainError =
  | InvalidProcessTypeError
  | DtoValidationError
  | BrainUnavailableError
  | BrainResponseError

const STATUS_MAP: Record<string, HttpStatus> = {
  InvalidProcessTypeError: HttpStatus.BAD_REQUEST,
  DtoValidationError: HttpStatus.BAD_REQUEST,
  BrainUnavailableError: HttpStatus.SERVICE_UNAVAILABLE,
}

@Catch(InvalidProcessTypeError, DtoValidationError, BrainUnavailableError, BrainResponseError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    const statusCode =
      exception instanceof BrainResponseError
        ? exception.statusCode
        : (STATUS_MAP[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR)

    response.status(statusCode).json({
      statusCode,
      message: exception.message,
      error: exception.name,
    })
  }
}

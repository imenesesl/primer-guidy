import { Catch, HttpStatus } from '@nestjs/common'
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import type { Response } from 'express'
import { JsonParseError, SchemaValidationError } from '../errors'

@Catch(JsonParseError, SchemaValidationError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: JsonParseError | SchemaValidationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    response.status(HttpStatus.BAD_GATEWAY).json({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: exception.message,
      error: exception.name,
    })
  }
}

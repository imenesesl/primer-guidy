import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>()
    const apiKey = request.headers['x-api-key']
    const expectedKey = process.env['BRAIN_API_KEY']

    if (!expectedKey) {
      throw new UnauthorizedException('Server misconfigured: BRAIN_API_KEY not set')
    }

    if (apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key')
    }

    return true
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import type { Auth } from 'firebase-admin/auth'
import { FIREBASE_AUTH } from '../../tokens'

const BEARER_PREFIX = 'Bearer '

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject(FIREBASE_AUTH) private readonly auth: Auth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; teacherUid?: string }>()

    const authorization = request.headers['authorization']
    if (!authorization?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const token = authorization.slice(BEARER_PREFIX.length)

    try {
      const decoded = await this.auth.verifyIdToken(token)
      request.teacherUid = decoded.uid
      return true
    } catch {
      throw new UnauthorizedException('Invalid Firebase token')
    }
  }
}

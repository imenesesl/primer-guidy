import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import type { FirebaseApp } from 'firebase/app'
import type { IFunctionsProvider } from '../../ports/functions.port'
import { FunctionsError, FunctionsErrorCode } from '../../ports/functions.types'

const mapError = (error: unknown): FunctionsError => {
  const functionsError = error as { code?: string; message?: string }
  const message = functionsError.message ?? 'An unknown error occurred'

  const codeMap: Record<string, FunctionsErrorCode> = {
    'functions/invalid-argument': FunctionsErrorCode.INVALID_ARGUMENT,
    'functions/not-found': FunctionsErrorCode.NOT_FOUND,
    'functions/already-exists': FunctionsErrorCode.ALREADY_EXISTS,
    'functions/unauthenticated': FunctionsErrorCode.UNAUTHENTICATED,
    'functions/unavailable': FunctionsErrorCode.UNAVAILABLE,
  }

  const code = codeMap[functionsError.code ?? ''] ?? FunctionsErrorCode.UNKNOWN
  return new FunctionsError(code, message)
}

export class FirebaseFunctionsAdapter implements IFunctionsProvider {
  private readonly functions

  constructor(app: FirebaseApp, emulatorHost?: string, emulatorPort?: number) {
    this.functions = getFunctions(app)
    if (emulatorHost && emulatorPort) {
      connectFunctionsEmulator(this.functions, emulatorHost, emulatorPort)
    }
  }

  async call<T>(name: string, data: unknown): Promise<T> {
    try {
      const callable = httpsCallable<unknown, T>(this.functions, name)
      const result = await callable(data)
      return result.data
    } catch (error) {
      throw mapError(error)
    }
  }
}

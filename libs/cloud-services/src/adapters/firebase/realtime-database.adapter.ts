import { getDatabase, ref, get, set, update, remove, push, onValue } from 'firebase/database'
import type { FirebaseApp } from 'firebase/app'
import type { IRealtimeDatabaseProvider } from '../../ports/realtime-database.port'
import { DatabaseError, DatabaseErrorCode } from '../../ports/realtime-database.types'

const mapError = (error: unknown): DatabaseError => {
  const firebaseError = error as { code?: string; message?: string }
  const message = firebaseError.message ?? 'An unknown error occurred'

  const codeMap: Record<string, DatabaseErrorCode> = {
    PERMISSION_DENIED: DatabaseErrorCode.PERMISSION_DENIED,
    DISCONNECTED: DatabaseErrorCode.DISCONNECTED,
  }

  const code = codeMap[firebaseError.code ?? ''] ?? DatabaseErrorCode.UNKNOWN
  return new DatabaseError(code, message)
}

export class FirebaseRealtimeDatabaseAdapter implements IRealtimeDatabaseProvider {
  private readonly db

  constructor(app: FirebaseApp) {
    this.db = getDatabase(app)
  }

  async get<T>(path: string): Promise<T | null> {
    try {
      const snapshot = await get(ref(this.db, path))
      return snapshot.exists() ? (snapshot.val() as T) : null
    } catch (error) {
      throw mapError(error)
    }
  }

  async set<T>(path: string, data: T): Promise<void> {
    try {
      await set(ref(this.db, path), data)
    } catch (error) {
      throw mapError(error)
    }
  }

  async update<T>(path: string, data: Partial<T>): Promise<void> {
    try {
      await update(ref(this.db, path), data as Record<string, unknown>)
    } catch (error) {
      throw mapError(error)
    }
  }

  async remove(path: string): Promise<void> {
    try {
      await remove(ref(this.db, path))
    } catch (error) {
      throw mapError(error)
    }
  }

  async push<T>(path: string, data: T): Promise<string> {
    try {
      const newRef = push(ref(this.db, path))
      await set(newRef, data)
      if (!newRef.key) {
        throw new DatabaseError(DatabaseErrorCode.UNKNOWN, 'Failed to generate key')
      }
      return newRef.key
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw mapError(error)
    }
  }

  onValue<T>(path: string, callback: (data: T | null) => void): () => void {
    const dbRef = ref(this.db, path)
    const unsubscribe = onValue(dbRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as T) : null)
    })
    return unsubscribe
  }
}

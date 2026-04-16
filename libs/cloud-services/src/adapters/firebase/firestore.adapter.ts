import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import type { FirebaseApp } from 'firebase/app'
import type { IFirestoreProvider } from '../../ports/firestore.port'
import type { QueryOptions } from '../../ports/firestore.types'
import { FirestoreError, FirestoreErrorCode } from '../../ports/firestore.types'

const mapError = (error: unknown): FirestoreError => {
  const firebaseError = error as { code?: string; message?: string }
  const message = firebaseError.message ?? 'An unknown error occurred'

  const codeMap: Record<string, FirestoreErrorCode> = {
    'permission-denied': FirestoreErrorCode.PERMISSION_DENIED,
    'not-found': FirestoreErrorCode.NOT_FOUND,
    'already-exists': FirestoreErrorCode.ALREADY_EXISTS,
  }

  const code = codeMap[firebaseError.code ?? ''] ?? FirestoreErrorCode.UNKNOWN
  return new FirestoreError(code, message)
}

const buildQuery = (
  db: ReturnType<typeof getFirestore>,
  collectionName: string,
  options?: QueryOptions,
) => {
  const collRef = collection(db, collectionName)

  const constraints = [
    ...(options?.filters?.map((f) => where(f.field, f.operator, f.value)) ?? []),
    ...(options?.orderBy?.map((o) => orderBy(o.field, o.direction)) ?? []),
    ...(options?.limit ? [limit(options.limit)] : []),
  ]

  return constraints.length > 0 ? query(collRef, ...constraints) : query(collRef)
}

export class FirebaseFirestoreAdapter implements IFirestoreProvider {
  private readonly db

  constructor(app: FirebaseApp) {
    this.db = getFirestore(app)
  }

  async getDoc<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionName, id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null
    } catch (error) {
      throw mapError(error)
    }
  }

  async getDocs<T>(collectionName: string, options?: QueryOptions): Promise<T[]> {
    try {
      const q = buildQuery(this.db, collectionName, options)
      const snapshot = await getDocs(q)
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
    } catch (error) {
      throw mapError(error)
    }
  }

  async addDoc<T extends Record<string, unknown>>(
    collectionName: string,
    data: T,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), data)
      return docRef.id
    } catch (error) {
      throw mapError(error)
    }
  }

  async updateDoc<T extends Record<string, unknown>>(
    collectionName: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, id)
      await updateDoc(docRef, data as Record<string, unknown>)
    } catch (error) {
      throw mapError(error)
    }
  }

  async deleteDoc(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      throw mapError(error)
    }
  }

  onSnapshot<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    options?: QueryOptions,
  ): () => void {
    const q = buildQuery(this.db, collectionName, options)
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
    })
  }
}

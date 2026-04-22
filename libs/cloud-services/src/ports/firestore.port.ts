import type { QueryOptions } from './firestore.types'

export interface IFirestoreProvider {
  getDoc<T>(collection: string, id: string): Promise<T | null>
  getDocs<T>(collection: string, options?: QueryOptions): Promise<T[]>
  setDoc<T extends Record<string, unknown>>(collection: string, id: string, data: T): Promise<void>
  addDoc<T extends Record<string, unknown>>(collection: string, data: T): Promise<string>
  updateDoc<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<void>
  deleteDoc(collection: string, id: string): Promise<void>
  onSnapshot<T>(
    collection: string,
    callback: (data: T[]) => void,
    options?: QueryOptions,
  ): () => void
  onSnapshotDoc<T>(collection: string, id: string, callback: (data: T | null) => void): () => void
}

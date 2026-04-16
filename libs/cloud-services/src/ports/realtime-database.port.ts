export interface IRealtimeDatabaseProvider {
  get<T>(path: string): Promise<T | null>
  set<T>(path: string, data: T): Promise<void>
  update<T>(path: string, data: Partial<T>): Promise<void>
  remove(path: string): Promise<void>
  push<T>(path: string, data: T): Promise<string>
  onValue<T>(path: string, callback: (data: T | null) => void): () => void
}

export interface IFunctionsProvider {
  call<T>(name: string, data: unknown): Promise<T>
}

export interface TabConfig {
  readonly labelKey: string
  readonly path: string
}

export interface TabLayoutProps {
  readonly tabs: readonly TabConfig[]
  readonly translate: (key: string) => string
}

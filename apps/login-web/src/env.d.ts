declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.css'

interface ImportMetaEnv {
  readonly BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

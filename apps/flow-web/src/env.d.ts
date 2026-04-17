declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.css'

interface ImportMetaEnv {
  readonly BASE_PATH: string
  readonly PUBLIC_FIREBASE_API_KEY: string
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string
  readonly PUBLIC_FIREBASE_DATABASE_URL: string
  readonly PUBLIC_FIREBASE_PROJECT_ID: string
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  readonly PUBLIC_FIREBASE_APP_ID: string
  readonly PUBLIC_FIREBASE_MEASUREMENT_ID: string
  readonly PUBLIC_FIREBASE_HOSTING_SITE: string
  readonly E2E_BYPASS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

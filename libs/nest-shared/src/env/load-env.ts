import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { config } from 'dotenv'

/**
 * Loads env files following the monorepo convention:
 *   1. `.env.local` (gitignored, highest priority — secrets & personal overrides)
 *   2. `.env`        (committed, safe defaults)
 *
 * Already-set env vars (from Docker, CI, Cloud Run) are never overridden.
 * Call this BEFORE NestFactory.create() so process.env is populated.
 */
export const loadMonorepoEnv = (appDir: string): void => {
  let dir = resolve(appDir)
  while (dir !== resolve(dir, '..')) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) break
    dir = resolve(dir, '..')
  }

  const files = [resolve(dir, '.env.local'), resolve(dir, '.env')]

  for (const file of files) {
    if (existsSync(file)) {
      config({ path: file, override: false })
    }
  }
}

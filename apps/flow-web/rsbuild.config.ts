import path from 'node:path'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'

const IS_PROD = process.env.NODE_ENV === 'production'
const DEV_PROXY = process.env.DEV_PROXY === 'true'
const DEPLOY_PREFIX = process.env.DEPLOY_PREFIX ?? ''
const FLOW_DEV_PORT = 3003
const BASE_PATH = IS_PROD || DEV_PROXY ? `${DEPLOY_PREFIX}/flow/` : '/'
const MONOREPO_ROOT = path.resolve(__dirname, '../../')
const { publicVars } = loadEnv({ cwd: MONOREPO_ROOT })

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: {
      ...publicVars,
      'import.meta.env.BASE_PATH': JSON.stringify(BASE_PATH),
      'import.meta.env.E2E_BYPASS': JSON.stringify(process.env.E2E_BYPASS ?? ''),
      'import.meta.env.VALIDATION_API_KEY': JSON.stringify(process.env.VALIDATION_API_KEY ?? ''),
      'import.meta.env.GUARDIAN_BASE_URL': JSON.stringify(process.env.GUARDIAN_BASE_URL ?? ''),
    },
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
  output: {
    assetPrefix: BASE_PATH,
  },
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack()],
    },
  },
  server: {
    port: DEV_PROXY ? FLOW_DEV_PORT : undefined,
    base: DEV_PROXY ? '/flow' : undefined,
  },
  html: {
    title: 'Primer Guidy — Flow',
  },
})

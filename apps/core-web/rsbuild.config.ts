import path from 'node:path'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'

const IS_PROD = process.env.NODE_ENV === 'production'
const DEPLOY_PREFIX = process.env.DEPLOY_PREFIX ?? ''
const BASE_PATH = IS_PROD ? `${DEPLOY_PREFIX}/core/` : '/'
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
  html: {
    title: 'Primer Guidy — Core',
  },
})

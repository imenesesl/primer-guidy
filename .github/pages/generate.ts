import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = 'primer-guidy'

interface Entry { name: string; route: string; description: string; icon: string }
interface Registry { apps: Entry[]; storybooks: Entry[] }

const registry: Registry = JSON.parse(readFileSync(resolve(__dirname, 'apps-registry.json'), 'utf-8'))

const card = (e: Entry, base: string) => `
      <a href="/${REPO}/${base}${e.route}/" class="Box-row d-flex flex-items-center flex-justify-between no-underline color-fg-default">
        <div class="d-flex flex-items-center" style="gap:0.75rem">
          <span class="f3">${e.icon}</span>
          <div>
            <span class="text-bold">${e.name}</span>
            <p class="color-fg-muted f6 mb-0">${e.description}</p>
          </div>
        </div>
        <span class="color-fg-muted">→</span>
      </a>`

const column = (title: string, entries: Entry[], base: string) =>
  entries.length === 0 ? '' : `
      <div class="flex-1" style="min-width:300px">
        <h3 class="f6 text-uppercase color-fg-muted mb-2">${title}</h3>
        <div class="Box">
          ${entries.map((e) => card(e, base)).join('')}
        </div>
      </div>`

const columns = [
  column('Live Apps', registry.apps, ''),
  column('Storybook', registry.storybooks, 'storybook/'),
].filter(Boolean).join('')

const template = readFileSync(resolve(__dirname, 'landing.html'), 'utf-8')
const html = template.replace('<!-- {{COLUMNS}} -->', columns)

const outDir = resolve(__dirname, '..', '..', 'dist-landing')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'index.html'), html)
copyFileSync(resolve(__dirname, '404.html'), resolve(outDir, '404.html'))

const total = registry.apps.length + registry.storybooks.length
// eslint-disable-next-line no-console
console.log(`Landing: ${total} entries generated.`)

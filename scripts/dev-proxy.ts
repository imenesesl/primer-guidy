/* eslint-disable no-console */
import http from 'node:http'
import net from 'node:net'
import { spawn } from 'node:child_process'

const PROXY_PORT = 3000
const LOGIN_PORT = 3001
const CORE_PORT = 3002
const FLOW_PORT = 3003
const GUARDIAN_PORT = 3010
const BRAIN_PORT = 3011

const HTTP_REDIRECT = 302
const HTTP_NOT_FOUND = 404
const HTTP_BAD_GATEWAY = 502

const routes: readonly {
  readonly prefix: string
  readonly target: number
  readonly stripPrefix?: boolean
}[] = [
  { prefix: '/api/guardian', target: GUARDIAN_PORT, stripPrefix: true },
  { prefix: '/login', target: LOGIN_PORT },
  { prefix: '/core', target: CORE_PORT },
  { prefix: '/flow', target: FLOW_PORT },
]

const getRoute = (url: string) => routes.find((r) => url.startsWith(r.prefix))

const proxy = http.createServer((req, res) => {
  const url = req.url ?? '/'

  if (url === '/') {
    res.writeHead(HTTP_REDIRECT, { Location: '/login/' })
    res.end()
    return
  }

  const route = getRoute(url)
  if (!route) {
    res.writeHead(HTTP_NOT_FOUND)
    res.end('Not found')
    return
  }

  const targetPath = route.stripPrefix ? url.slice(route.prefix.length) || '/' : url

  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port: route.target,
      path: targetPath,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? HTTP_BAD_GATEWAY, proxyRes.headers)
      proxyRes.pipe(res)
    },
  )

  proxyReq.on('error', () => {
    res.writeHead(HTTP_BAD_GATEWAY)
    res.end(`Waiting for app on port ${route.target}...`)
  })

  req.pipe(proxyReq)
})

proxy.on('upgrade', (req, socket, head) => {
  const url = req.url ?? '/'
  const route = getRoute(url)
  if (!route) {
    socket.destroy()
    return
  }

  const wsPath = route.stripPrefix ? url.slice(route.prefix.length) || '/' : url

  const conn = net.connect(route.target, 'localhost', () => {
    const reqLine = `${req.method} ${wsPath} HTTP/${req.httpVersion}\r\n`
    const headers = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n')
    conn.write(`${reqLine}${headers}\r\n\r\n`)
    conn.write(head)
    socket.pipe(conn).pipe(socket)
  })

  conn.on('error', () => socket.destroy())
})

const env = { ...process.env, DEV_PROXY: 'true' }

const spawnApp = (filter: string) =>
  spawn('pnpm', ['--filter', filter, 'dev'], { stdio: 'inherit', env })

const children = [
  spawnApp('@primer-guidy/brain-server'),
  spawnApp('@primer-guidy/guardian-server'),
  spawnApp('@primer-guidy/login-web'),
  spawnApp('@primer-guidy/core-web'),
  spawnApp('@primer-guidy/flow-web'),
]

proxy.listen(PROXY_PORT, () => {
  console.log(`\n  Dev proxy running at http://localhost:${PROXY_PORT}`)
  console.log(`  /login/                → localhost:${LOGIN_PORT}`)
  console.log(`  /core/                 → localhost:${CORE_PORT}`)
  console.log(`  /flow/                 → localhost:${FLOW_PORT}`)
  console.log(`  /api/guardian           → localhost:${GUARDIAN_PORT}`)
  console.log(`  brain-server           → localhost:${BRAIN_PORT}\n`)
})

const cleanup = () => {
  for (const child of children) child.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

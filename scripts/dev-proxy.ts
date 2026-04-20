/* eslint-disable no-console */
import http from 'node:http'
import net from 'node:net'
import { spawn } from 'node:child_process'

const PROXY_PORT = 3000
const LOGIN_PORT = 3001
const CORE_PORT = 3002
const FLOW_PORT = 3003
const PROMPT_VALIDATION_PORT = 3010

const HTTP_REDIRECT = 302
const HTTP_NOT_FOUND = 404
const HTTP_BAD_GATEWAY = 502

const routes: readonly { readonly prefix: string; readonly target: number }[] = [
  { prefix: '/api/prompt-validation', target: PROMPT_VALIDATION_PORT },
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

  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port: route.target,
      path: url,
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

  const conn = net.connect(route.target, 'localhost', () => {
    const reqLine = `${req.method} ${url} HTTP/${req.httpVersion}\r\n`
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

const login = spawn('pnpm', ['--filter', '@primer-guidy/login-web', 'dev'], {
  stdio: 'inherit',
  env,
})

const core = spawn('pnpm', ['--filter', '@primer-guidy/core-web', 'dev'], {
  stdio: 'inherit',
  env,
})

const flow = spawn('pnpm', ['--filter', '@primer-guidy/flow-web', 'dev'], {
  stdio: 'inherit',
  env,
})

proxy.listen(PROXY_PORT, () => {
  console.log(`\n  Dev proxy running at http://localhost:${PROXY_PORT}`)
  console.log(`  /login/                → localhost:${LOGIN_PORT}`)
  console.log(`  /core/                 → localhost:${CORE_PORT}`)
  console.log(`  /flow/                 → localhost:${FLOW_PORT}`)
  console.log(`  /api/prompt-validation → localhost:${PROMPT_VALIDATION_PORT}\n`)
})

const cleanup = () => {
  login.kill()
  core.kill()
  flow.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

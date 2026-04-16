import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { createAppRouter } from './router'
import './i18n/i18n.config'
import './global.css'

const ONE_SECOND_MS = 1000
const ONE_MINUTE_S = 60
const STALE_TIME_MS = ONE_SECOND_MS * ONE_MINUTE_S

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
    },
  },
})

const router = createAppRouter(queryClient)

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

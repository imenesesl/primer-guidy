import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { CloudServices } from '@primer-guidy/cloud-services'

export interface AppProvidersProps {
  readonly queryClient: QueryClient
  readonly cloudServices: CloudServices
  readonly children: ReactNode
}

export interface ThemedContentProps {
  readonly children: ReactNode
}

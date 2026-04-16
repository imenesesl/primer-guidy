import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import type { CloudServices } from '@primer-guidy/cloud-services'
import { AppProviders } from './AppProviders'

vi.mock('@primer/react', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BaseStyles: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({ theme: { colors: {} } }),
}))

vi.mock('@primer-guidy/cloud-services', () => ({
  CloudServicesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockCloudServices = {
  auth: {},
  realtimeDatabase: {},
  firestore: {},
  hosting: {},
} as unknown as CloudServices

describe('AppProviders', () => {
  it('renders children within the provider stack', () => {
    const queryClient = new QueryClient()

    render(
      <AppProviders queryClient={queryClient} cloudServices={mockCloudServices}>
        <span>app content</span>
      </AppProviders>,
    )

    expect(screen.getByText('app content')).toBeVisible()
  })
})

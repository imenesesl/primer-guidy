import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@primer/react'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { status } = useAuthGuard()

  if (status !== AuthGuardStatus.Authenticated) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size="large" />
      </div>
    )
  }

  return <Outlet />
}

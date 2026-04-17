import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@primer/react'
import { useAuthGuard, AuthGuardStatus } from '@/modules/AuthGuard'
import styles from './_protected.module.scss'

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { status } = useAuthGuard()

  if (status !== AuthGuardStatus.Authenticated) {
    return (
      <div className={styles.loading}>
        <Spinner size="large" />
      </div>
    )
  }

  return <Outlet />
}

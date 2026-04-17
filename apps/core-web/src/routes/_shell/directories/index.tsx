import { createFileRoute, redirect } from '@tanstack/react-router'
import { CoreRoutes } from '@/routes/routes'

export const Route = createFileRoute('/_shell/directories/')({
  beforeLoad: () => {
    throw redirect({ to: CoreRoutes.DirectoriesUsers })
  },
})

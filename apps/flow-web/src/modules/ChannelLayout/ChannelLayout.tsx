import clsx from 'clsx'
import { Outlet, Link, useParams, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { resolveBasePath, buildChannelContentPath, buildChannelPendingPath } from '@/utils/routes'
import styles from './ChannelLayout.module.scss'

export const ChannelLayout = () => {
  const { t: tShell } = useTranslation('shell')
  const { workspaceId, channelId } = useParams({ strict: false }) as {
    workspaceId: string
    channelId: string
  }

  const { pathname } = useLocation()
  const basePath = resolveBasePath(pathname)
  const contentPath = buildChannelContentPath(basePath, workspaceId, channelId)
  const pendingPath = buildChannelPendingPath(basePath, workspaceId, channelId)

  return (
    <div className={styles.root}>
      <nav className={styles.tabBar}>
        <Link
          to={contentPath}
          className={styles.tab}
          activeProps={{ className: clsx(styles.tab, { [styles.tabActive as string]: true }) }}
        >
          {tShell('channelTabs.content')}
        </Link>
        <Link
          to={pendingPath}
          className={styles.tab}
          activeProps={{ className: clsx(styles.tab, { [styles.tabActive as string]: true }) }}
        >
          {tShell('channelTabs.pending')}
        </Link>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

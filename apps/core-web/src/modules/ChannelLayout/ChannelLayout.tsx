import clsx from 'clsx'
import { Outlet, Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { buildChannelContentPath, buildChannelAiPath } from '@/utils/routes'
import styles from './ChannelLayout.module.scss'

export const ChannelLayout = () => {
  const { t: tShell } = useTranslation('shell')
  const { channelId } = useParams({ strict: false }) as {
    channelId: string
  }

  const contentPath = buildChannelContentPath(channelId)
  const aiPath = buildChannelAiPath(channelId)

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
          to={aiPath}
          className={styles.tab}
          activeProps={{ className: clsx(styles.tab, { [styles.tabActive as string]: true }) }}
        >
          {tShell('channelTabs.ai')}
        </Link>
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

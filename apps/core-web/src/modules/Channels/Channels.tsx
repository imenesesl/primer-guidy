import { Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CHANNEL_TABS } from './Channels.utils'
import styles from './Channels.module.scss'

export const Channels = () => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.root}>
      <nav className={styles.tabBar}>
        {CHANNEL_TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={styles.tab}
            activeProps={{ className: `${styles.tab} ${styles.tabActive}` }}
          >
            {tChannels(tab.labelKey)}
          </Link>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

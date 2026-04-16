import { Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ACTIVITY_TABS } from './Activity.utils'
import styles from './Activity.module.scss'

export const Activity = () => {
  const { t: tActivity } = useTranslation('activity')

  return (
    <div className={styles.root}>
      <nav className={styles.tabBar}>
        {ACTIVITY_TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={styles.tab}
            activeProps={{ className: `${styles.tab} ${styles.tabActive}` }}
          >
            {tActivity(tab.labelKey)}
          </Link>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

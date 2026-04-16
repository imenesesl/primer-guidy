import { Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DIRECTORY_TABS } from './Directories.utils'
import styles from './Directories.module.scss'

export const Directories = () => {
  const { t: tDirectories } = useTranslation('directories')

  return (
    <div className={styles.root}>
      <nav className={styles.tabBar}>
        {DIRECTORY_TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={styles.tab}
            activeProps={{ className: `${styles.tab} ${styles.tabActive}` }}
          >
            {tDirectories(tab.labelKey)}
          </Link>
        ))}
      </nav>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

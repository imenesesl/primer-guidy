import clsx from 'clsx'
import { Outlet, Link } from '@tanstack/react-router'
import type { TabLayoutProps } from './TabLayout.types'
import styles from './TabLayout.module.scss'

export const TabLayout = ({ tabs, translate }: TabLayoutProps) => (
  <div className={styles.root}>
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={styles.tab}
          activeProps={{ className: clsx(styles.tab, styles.tabActive) }}
        >
          {translate(tab.labelKey)}
        </Link>
      ))}
    </nav>
    <div className={styles.content}>
      <Outlet />
    </div>
  </div>
)

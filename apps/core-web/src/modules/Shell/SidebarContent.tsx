import { Text } from '@primer/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useMatchRoute } from '@tanstack/react-router'
import { RailItem, SidebarItem, useLayoutStore } from '@primer-guidy/components-web'
import type { SidebarContentProps } from './SidebarContent.types'
import styles from './Shell.module.scss'

export const SidebarContent = ({ userName, sidebarItems }: SidebarContentProps) => {
  const { t: tShell } = useTranslation('shell')
  const { t: tLayout } = useTranslation('layout')
  const railVisible = useLayoutStore((s) => s.railVisible)
  const toggleRail = useLayoutStore((s) => s.toggleRail)
  const matchRoute = useMatchRoute()

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <RailItem
          variant="action"
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={tLayout('actions.toggleRail')}
          onClick={toggleRail}
        />
        {userName && (
          <Text as="span" className={styles.sidebarUserName}>
            {userName}
          </Text>
        )}
      </div>
      <div className={styles.sidebarDivider} />
      <div className={styles.sidebarNav}>
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={tShell(item.labelKey)}
            path={item.path}
            active={!!matchRoute({ to: item.path, fuzzy: true })}
          />
        ))}
      </div>
    </nav>
  )
}

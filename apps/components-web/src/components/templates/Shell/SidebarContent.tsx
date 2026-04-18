import { Text } from '@primer/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useMatchRoute, useLocation } from '@tanstack/react-router'
import { RailItem } from '../../atoms/RailItem'
import { SidebarItem } from '../../atoms/SidebarItem'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'
import { SidebarGroup } from '../../molecules/SidebarGroup'
import { useLayoutStore } from '../../../stores/layout.store'
import { resolveSidebarItems } from './SidebarContent.utils'
import type { SidebarContentProps } from './SidebarContent.types'
import styles from './Shell.module.scss'

export const SidebarContent = ({ userName, sidebarItemsMap }: SidebarContentProps) => {
  const { t: tShell } = useTranslation('shell')
  const { t: tLayout } = useTranslation('layout')
  const railVisible = useLayoutStore((s) => s.railVisible)
  const toggleRail = useLayoutStore((s) => s.toggleRail)
  const matchRoute = useMatchRoute()
  const location = useLocation()
  const sidebarItems = resolveSidebarItems(location.pathname, sidebarItemsMap)

  const resolveLabel = (item: SidebarItemConfig) => item.label ?? tShell(item.labelKey ?? '')

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <RailItem
          variant="action"
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={tLayout('actions.toggleRail')}
          onClick={toggleRail}
        />
        {userName ? (
          <Text as="span" className={styles.sidebarUserName}>
            {userName}
          </Text>
        ) : (
          <div className={styles.sidebarUserNameSkeleton} />
        )}
      </div>
      <div className={styles.sidebarNav}>
        {sidebarItems.map((item) =>
          item.children && item.children.length > 0 ? (
            <SidebarGroup
              key={item.labelKey ?? item.label}
              item={item}
              children={item.children}
              resolveLabel={resolveLabel}
            />
          ) : (
            <SidebarItem
              key={item.labelKey ?? item.label}
              icon={item.icon}
              label={resolveLabel(item)}
              path={item.path}
              active={!!matchRoute({ to: item.path, fuzzy: true })}
              disabled={item.disabled}
            />
          ),
        )}
      </div>
    </nav>
  )
}

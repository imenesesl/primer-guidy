import { Text } from '@primer/react'
import { SidebarCollapseIcon, SidebarExpandIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from '@tanstack/react-router'
import { RailItem } from '../../atoms/RailItem'
import { useLayoutStore } from '../../../stores/layout.store'
import { buildBreadcrumb } from './ContentHeader.utils'
import type { ContentHeaderProps } from './ContentHeader.types'
import styles from './Shell.module.scss'

export const ContentHeader = ({ headerAction, breadcrumbResolver }: ContentHeaderProps) => {
  const { t: tLayout } = useTranslation('layout')
  const { t: tShell } = useTranslation('shell')
  const sidebarVisible = useLayoutStore((s) => s.sidebarVisible)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)
  const location = useLocation()
  const breadcrumb = buildBreadcrumb(location.pathname, tShell, breadcrumbResolver)

  return (
    <div className={styles.contentHeader}>
      <RailItem
        variant="action"
        icon={sidebarVisible ? SidebarCollapseIcon : SidebarExpandIcon}
        aria-label={tLayout('actions.toggleSidebar')}
        onClick={toggleSidebar}
      />
      <Text as="span" className={styles.breadcrumb}>
        {breadcrumb}
      </Text>
      {headerAction}
    </div>
  )
}

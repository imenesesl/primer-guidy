import { SidebarCollapseIcon, SidebarExpandIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { RailItem, useLayoutStore } from '@primer-guidy/components-web'
import styles from './Shell.module.scss'

export const ContentHeader = () => {
  const { t: tLayout } = useTranslation('layout')
  const sidebarVisible = useLayoutStore((s) => s.sidebarVisible)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)

  return (
    <div className={styles.contentHeader}>
      <RailItem
        variant="action"
        icon={sidebarVisible ? SidebarCollapseIcon : SidebarExpandIcon}
        aria-label={tLayout('actions.toggleSidebar')}
        onClick={toggleSidebar}
      />
    </div>
  )
}

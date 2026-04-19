import { Text } from '@primer/react'
import { SidebarCollapseIcon, SidebarExpandIcon } from '@primer/octicons-react'
import { RailItem } from '../../atoms/RailItem'
import type { ContentHeaderProps } from './ContentHeader.types'
import styles from './Shell.module.scss'

export const ContentHeader = ({
  headerAction,
  sidebarVisible,
  onToggleSidebar,
  toggleSidebarLabel,
  breadcrumb,
}: ContentHeaderProps) => {
  return (
    <div className={styles.contentHeader}>
      <RailItem
        variant="action"
        icon={sidebarVisible ? SidebarCollapseIcon : SidebarExpandIcon}
        aria-label={toggleSidebarLabel}
        onClick={onToggleSidebar}
      />
      <Text as="span" className={styles.breadcrumb}>
        {breadcrumb}
      </Text>
      {headerAction}
    </div>
  )
}

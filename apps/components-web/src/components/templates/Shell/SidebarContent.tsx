import { Text } from '@primer/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react'
import { RailItem } from '../../atoms/RailItem'
import { SidebarItem } from '../../atoms/SidebarItem'
import { SidebarGroup } from '../../molecules/SidebarGroup'
import type { SidebarContentProps } from './SidebarContent.types'
import styles from './Shell.module.scss'

export const SidebarContent = ({
  userName,
  sidebarItems,
  railVisible,
  onToggleRail,
  toggleRailLabel,
  currentPath,
  isActive,
  resolveLabel,
}: SidebarContentProps) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <RailItem
          variant="action"
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={toggleRailLabel}
          onClick={onToggleRail}
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
              expanded={currentPath.startsWith(item.path)}
              isActive={isActive}
            />
          ) : (
            <SidebarItem
              key={item.labelKey ?? item.label}
              icon={item.icon}
              label={resolveLabel(item)}
              path={item.path}
              active={isActive(item.path)}
              disabled={item.disabled}
            />
          ),
        )}
      </div>
    </nav>
  )
}

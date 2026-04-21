import { useCallback } from 'react'
import { Text } from '@primer/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react'
import { RailItem } from '../../atoms/RailItem'
import { SidebarItem } from '../../atoms/SidebarItem'
import { SidebarGroup } from '../../molecules/SidebarGroup'
import { isDesktop } from '../../../utils/viewport.utils'
import type { SidebarContentProps } from './SidebarContent.types'
import styles from './Shell.module.scss'

const SKELETON_COUNT = 3

export const SidebarContent = ({
  userName,
  sidebarItems,
  sidebarLoading,
  railVisible,
  onToggleRail,
  onCloseSidebar,
  toggleRailLabel,
  closeSidebarLabel,
  isActive,
  resolveLabel,
}: SidebarContentProps) => {
  const handleHeaderAction = useCallback(() => {
    if (isDesktop()) {
      onToggleRail()
    } else {
      onCloseSidebar()
    }
  }, [onToggleRail, onCloseSidebar])

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <RailItem
          variant="action"
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={isDesktop() ? toggleRailLabel : closeSidebarLabel}
          onClick={handleHeaderAction}
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
        {sidebarItems.length > 0
          ? sidebarItems.map((item) =>
              item.children || item.loading ? (
                <SidebarGroup
                  key={item.labelKey ?? item.label}
                  item={item}
                  children={item.children ?? []}
                  loading={item.loading}
                  resolveLabel={resolveLabel}
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
            )
          : sidebarLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <div key={i} className={styles.sidebarItemSkeleton} />
              ))
            : null}
      </div>
    </nav>
  )
}

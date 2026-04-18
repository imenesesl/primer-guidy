import clsx from 'clsx'
import { useLocation, useMatchRoute } from '@tanstack/react-router'
import { SidebarItem } from '../../atoms/SidebarItem'
import type { SidebarGroupProps } from './SidebarGroup.types'
import styles from './SidebarGroup.module.scss'

export const SidebarGroup = ({ item, children, resolveLabel }: SidebarGroupProps) => {
  const location = useLocation()
  const matchRoute = useMatchRoute()
  const isExpanded = location.pathname.startsWith(item.path)

  return (
    <div className={styles.root}>
      <SidebarItem
        icon={item.icon}
        label={resolveLabel(item)}
        path={item.path}
        active={!!matchRoute({ to: item.path, fuzzy: true })}
        disabled={item.disabled}
      />
      {isExpanded && children.length > 0 && (
        <div className={styles.children}>
          {children.map((child) => {
            const isActive = !!matchRoute({ to: child.path, fuzzy: true })
            return (
              <div key={child.labelKey ?? child.label} className={styles.childItem}>
                <span className={clsx(styles.dot, { [styles.dotActive as string]: isActive })} />
                <SidebarItem
                  icon={child.icon}
                  label={resolveLabel(child)}
                  path={child.path}
                  active={isActive}
                  disabled={child.disabled}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

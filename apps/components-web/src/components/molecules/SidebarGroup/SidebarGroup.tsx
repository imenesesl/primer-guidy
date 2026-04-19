import clsx from 'clsx'
import { Text } from '@primer/react'
import { SidebarItem } from '../../atoms/SidebarItem'
import type { SidebarGroupProps } from './SidebarGroup.types'
import styles from './SidebarGroup.module.scss'

const SKELETON_COUNT = 2

export const SidebarGroup = ({
  item,
  children,
  loading,
  resolveLabel,
  isActive,
}: SidebarGroupProps) => {
  return (
    <div className={styles.root}>
      <SidebarItem
        icon={item.icon}
        label={resolveLabel(item)}
        path={item.path}
        active={isActive(item.path)}
        disabled={item.disabled}
        variant="header"
      />
      {loading && children.length === 0 ? (
        <div className={styles.children}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.childSkeleton} />
          ))}
        </div>
      ) : (
        children.length > 0 && (
          <div className={styles.children}>
            {children.map((child) => {
              const active = isActive(child.path)
              return (
                <div key={child.labelKey ?? child.label} className={styles.childItem}>
                  <Text
                    as="span"
                    className={clsx(styles.dot, { [styles.dotActive as string]: active })}
                  />
                  <SidebarItem
                    icon={child.icon}
                    label={resolveLabel(child)}
                    path={child.path}
                    active={active}
                    disabled={child.disabled}
                  />
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

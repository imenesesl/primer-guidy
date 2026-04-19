import clsx from 'clsx'
import { Button } from '@primer/react'
import type { WorkspaceLayoutProps } from './WorkspaceLayout.types'
import styles from './WorkspaceLayout.module.scss'

export const WorkspaceLayout = ({
  rail,
  sidebar,
  children,
  railVisible,
  sidebarVisible,
  onCloseSidebar,
  railLabel,
  sidebarLabel,
  closeSidebarLabel,
}: WorkspaceLayoutProps) => {
  return (
    <div className={styles.root}>
      <aside
        className={clsx(styles.rail, { [styles.railHidden as string]: !railVisible })}
        aria-label={railLabel}
      >
        {rail}
      </aside>
      <aside
        className={clsx(styles.sidebar, { [styles.sidebarHidden as string]: !sidebarVisible })}
        aria-label={sidebarLabel}
      >
        {sidebar}
      </aside>
      <Button
        variant="invisible"
        className={clsx(styles.backdrop, { [styles.backdropHidden as string]: !sidebarVisible })}
        aria-label={closeSidebarLabel}
        onClick={onCloseSidebar}
        tabIndex={-1}
      />
      <main className={styles.content}>{children}</main>
    </div>
  )
}

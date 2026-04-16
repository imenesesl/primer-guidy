import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useLayoutStore } from '../../../stores/layout.store'
import type { WorkspaceLayoutProps } from './WorkspaceLayout.types'
import styles from './WorkspaceLayout.module.scss'

export const WorkspaceLayout = ({ rail, sidebar, children }: WorkspaceLayoutProps) => {
  const { t: tLayout } = useTranslation('layout')
  const railVisible = useLayoutStore((s) => s.railVisible)
  const sidebarVisible = useLayoutStore((s) => s.sidebarVisible)
  const closeSidebar = useLayoutStore((s) => s.closeSidebar)

  return (
    <div className={styles.root}>
      <aside
        className={clsx(styles.rail, { [styles.railHidden as string]: !railVisible })}
        aria-label={tLayout('rail.label')}
      >
        {rail}
      </aside>
      <aside
        className={clsx(styles.sidebar, { [styles.sidebarHidden as string]: !sidebarVisible })}
        aria-label={tLayout('sidebar.label')}
      >
        {sidebar}
      </aside>
      <button
        className={clsx(styles.backdrop, { [styles.backdropHidden as string]: !sidebarVisible })}
        type="button"
        aria-label={tLayout('actions.closeSidebar')}
        onClick={closeSidebar}
        tabIndex={-1}
      />
      <main className={styles.content}>{children}</main>
    </div>
  )
}

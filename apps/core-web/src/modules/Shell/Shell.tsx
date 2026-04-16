import { useMemo } from 'react'
import { Text, useTheme } from '@primer/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import {
  WorkspaceLayout,
  Rail,
  RailItem,
  createLayoutStore,
  LayoutStoreProvider,
  useLayoutStore,
} from '@primer-guidy/components-web'
import type { ShellProps } from './Shell.types'
import { buildThemeVars } from './Shell.utils'
import styles from './Shell.module.scss'

const SidebarContent = () => {
  const { t: tShell } = useTranslation('shell')
  const { t: tLayout } = useTranslation('layout')
  const railVisible = useLayoutStore((s) => s.railVisible)
  const toggleRail = useLayoutStore((s) => s.toggleRail)

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <RailItem
          variant="action"
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={tLayout('actions.toggleRail')}
          onClick={toggleRail}
        />
      </div>
      <Text as="p">{tShell('sidebar.placeholder')}</Text>
    </nav>
  )
}

const ContentHeader = () => {
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

export const Shell = ({ railItems, avatarSrc, avatarAlt, children }: ShellProps) => {
  const { theme } = useTheme()
  const layoutStore = useMemo(() => createLayoutStore(), [])
  const themeVars = buildThemeVars(theme?.colors)

  return (
    <LayoutStoreProvider value={layoutStore}>
      <div style={themeVars} className={styles.themeRoot}>
        <WorkspaceLayout
          rail={<Rail items={railItems} avatarSrc={avatarSrc} avatarAlt={avatarAlt} />}
          sidebar={<SidebarContent />}
        >
          <ContentHeader />
          {children}
        </WorkspaceLayout>
      </div>
    </LayoutStoreProvider>
  )
}

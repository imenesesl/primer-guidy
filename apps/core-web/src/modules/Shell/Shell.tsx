import { useMemo } from 'react'
import { Text, IconButton, useTheme } from '@primer/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { WorkspaceLayout } from '@/components/templates/WorkspaceLayout'
import { Rail } from '@/components/organisms/Rail'
import { createLayoutStore, LayoutStoreProvider, useLayoutStore } from '@/stores/layout.store'
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
        <IconButton
          icon={railVisible ? ChevronLeftIcon : ChevronRightIcon}
          aria-label={tLayout('actions.toggleRail')}
          variant="invisible"
          size="small"
          className={styles.toggleButton}
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
      <IconButton
        icon={sidebarVisible ? SidebarCollapseIcon : SidebarExpandIcon}
        aria-label={tLayout('actions.toggleSidebar')}
        variant="invisible"
        size="small"
        className={styles.toggleButton}
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

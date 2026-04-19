import { useCallback } from 'react'
import { useTheme } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useMatchRoute, useLocation } from '@tanstack/react-router'
import { useLayoutStore } from '../../../stores/layout.store'
import { useCloseSidebarOnMobileNav } from '../../../hooks'
import { buildThemeVars } from '../../../utils/theme.utils'
import { buildBreadcrumb } from './ContentHeader.utils'
import { resolveSidebarItems } from './SidebarContent.utils'
import { WorkspaceLayout } from '../WorkspaceLayout'
import { Rail } from '../../organisms/Rail'
import { SidebarContent } from './SidebarContent'
import { ContentHeader } from './ContentHeader'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'
import type { ShellProps } from './Shell.types'
import styles from './Shell.module.scss'

export const Shell = ({
  railItems,
  sidebarItemsMap,
  sidebarLoading,
  avatarSrc,
  avatarName,
  userName,
  headerAction,
  breadcrumbResolver,
  children,
}: ShellProps) => {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)
  const { t: tLayout } = useTranslation('layout')
  const { t: tShell } = useTranslation('shell')
  const railVisible = useLayoutStore((s) => s.railVisible)
  const sidebarVisible = useLayoutStore((s) => s.sidebarVisible)
  const toggleRail = useLayoutStore((s) => s.toggleRail)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)
  const closeSidebar = useLayoutStore((s) => s.closeSidebar)
  const matchRoute = useMatchRoute()
  const location = useLocation()

  useCloseSidebarOnMobileNav(location.pathname, closeSidebar)

  const breadcrumb = buildBreadcrumb(
    location.pathname,
    tShell,
    breadcrumbResolver,
    tLayout('breadcrumb.separator'),
  )
  const sidebarItems = resolveSidebarItems(location.pathname, sidebarItemsMap)

  const isActive = useCallback(
    (path: string) => !!matchRoute({ to: path, fuzzy: true }),
    [matchRoute],
  )

  const resolveLabel = useCallback(
    (item: SidebarItemConfig) => item.label ?? tShell(item.labelKey ?? ''),
    [tShell],
  )

  return (
    <div style={themeVars} className={styles.themeRoot}>
      <WorkspaceLayout
        rail={
          <Rail
            items={railItems}
            avatarSrc={avatarSrc}
            avatarName={avatarName}
            isActive={isActive}
          />
        }
        sidebar={
          <SidebarContent
            userName={userName}
            sidebarItems={sidebarItems}
            sidebarLoading={sidebarLoading}
            railVisible={railVisible}
            onToggleRail={toggleRail}
            onCloseSidebar={closeSidebar}
            toggleRailLabel={tLayout('actions.toggleRail')}
            closeSidebarLabel={tLayout('actions.closeSidebar')}
            isActive={isActive}
            resolveLabel={resolveLabel}
          />
        }
        railVisible={railVisible}
        sidebarVisible={sidebarVisible}
        onCloseSidebar={closeSidebar}
        railLabel={tLayout('rail.label')}
        sidebarLabel={tLayout('sidebar.label')}
        closeSidebarLabel={tLayout('actions.closeSidebar')}
      >
        <ContentHeader
          headerAction={headerAction}
          sidebarVisible={sidebarVisible}
          onToggleSidebar={toggleSidebar}
          toggleSidebarLabel={tLayout('actions.toggleSidebar')}
          breadcrumb={breadcrumb}
        />
        {children}
      </WorkspaceLayout>
    </div>
  )
}

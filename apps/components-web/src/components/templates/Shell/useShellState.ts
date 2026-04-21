import { useCallback } from 'react'
import { useTheme } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useMatchRoute, useLocation } from '@tanstack/react-router'
import { useLayoutStore } from '../../../stores/layout.store'
import { useCloseSidebarOnMobileNav } from '../../../hooks'
import { buildThemeVars } from '../../../utils/theme.utils'
import { buildBreadcrumb } from './ContentHeader.utils'
import { resolveSidebarItems } from './SidebarContent.utils'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'
import type { ShellProps } from './Shell.types'

export const useShellState = ({
  sidebarItemsMap,
  breadcrumbResolver,
}: Pick<ShellProps, 'sidebarItemsMap' | 'breadcrumbResolver'>) => {
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

  return {
    themeVars,
    railVisible,
    sidebarVisible,
    toggleRail,
    toggleSidebar,
    closeSidebar,
    breadcrumb,
    sidebarItems,
    isActive,
    resolveLabel,
    labels: {
      toggleRail: tLayout('actions.toggleRail'),
      closeSidebar: tLayout('actions.closeSidebar'),
      toggleSidebar: tLayout('actions.toggleSidebar'),
      rail: tLayout('rail.label'),
      sidebar: tLayout('sidebar.label'),
    },
  }
}

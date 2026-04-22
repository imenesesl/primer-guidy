import { WorkspaceLayout } from '../WorkspaceLayout'
import { Rail } from '../../organisms/Rail'
import { SidebarContent } from './SidebarContent'
import { ContentHeader } from './ContentHeader'
import { useShellState } from './useShellState'
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
  const {
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
    labels,
  } = useShellState({ sidebarItemsMap, breadcrumbResolver })

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
            toggleRailLabel={labels.toggleRail}
            closeSidebarLabel={labels.closeSidebar}
            isActive={isActive}
            resolveLabel={resolveLabel}
          />
        }
        railVisible={railVisible}
        sidebarVisible={sidebarVisible}
        onCloseSidebar={closeSidebar}
        railLabel={labels.rail}
        sidebarLabel={labels.sidebar}
        closeSidebarLabel={labels.closeSidebar}
      >
        <ContentHeader
          headerAction={headerAction}
          sidebarVisible={sidebarVisible}
          onToggleSidebar={toggleSidebar}
          toggleSidebarLabel={labels.toggleSidebar}
          breadcrumb={breadcrumb}
        />
        <div className={styles.childrenArea}>{children}</div>
      </WorkspaceLayout>
    </div>
  )
}

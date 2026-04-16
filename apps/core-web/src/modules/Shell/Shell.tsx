import { useTheme } from '@primer/react'
import { WorkspaceLayout, Rail, buildThemeVars } from '@primer-guidy/components-web'
import type { ShellProps } from './Shell.types'
import styles from './Shell.module.scss'
import { SidebarContent } from './SidebarContent'
import { ContentHeader } from './ContentHeader'

export const Shell = ({ railItems, avatarSrc, avatarName, children }: ShellProps) => {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  return (
    <div style={themeVars} className={styles.themeRoot}>
      <WorkspaceLayout
        rail={<Rail items={railItems} avatarSrc={avatarSrc} avatarName={avatarName} />}
        sidebar={<SidebarContent />}
      >
        <ContentHeader />
        {children}
      </WorkspaceLayout>
    </div>
  )
}

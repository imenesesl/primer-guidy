import { useTheme } from '@primer/react'
import { WorkspaceLayout } from '../WorkspaceLayout'
import { Rail } from '../../organisms/Rail'
import { buildThemeVars } from '../../../utils/theme.utils'
import type { ShellProps } from './Shell.types'
import { SidebarContent } from './SidebarContent'
import { ContentHeader } from './ContentHeader'
import styles from './Shell.module.scss'

export const Shell = ({
  railItems,
  sidebarItemsMap,
  avatarSrc,
  avatarName,
  userName,
  headerAction,
  children,
}: ShellProps) => {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  return (
    <div style={themeVars} className={styles.themeRoot}>
      <WorkspaceLayout
        rail={<Rail items={railItems} avatarSrc={avatarSrc} avatarName={avatarName} />}
        sidebar={<SidebarContent userName={userName} sidebarItemsMap={sidebarItemsMap} />}
      >
        <ContentHeader headerAction={headerAction} />
        {children}
      </WorkspaceLayout>
    </div>
  )
}

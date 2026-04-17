import { useTheme } from '@primer/react'
import type { ThemedContentProps } from './AppProviders.types'
import { buildThemeVars } from '../../../utils/theme.utils'

export const ThemedContent = ({ children }: ThemedContentProps) => {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  return <div style={themeVars}>{children}</div>
}

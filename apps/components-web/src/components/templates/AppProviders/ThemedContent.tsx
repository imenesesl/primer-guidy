import { useEffect } from 'react'
import { useTheme } from '@primer/react'
import type { ThemedContentProps } from './AppProviders.types'
import { buildThemeVars } from '../../../utils/theme.utils'

export const ThemedContent = ({ children }: ThemedContentProps) => {
  const { theme } = useTheme()
  const themeVars = buildThemeVars(theme?.colors)

  useEffect(() => {
    if (theme?.colors?.canvas?.inset) {
      document.body.style.backgroundColor = theme.colors.canvas.inset
    }
  }, [theme?.colors?.canvas?.inset])

  return <div style={themeVars}>{children}</div>
}

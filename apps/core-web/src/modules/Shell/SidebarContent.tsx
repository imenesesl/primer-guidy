import { Text } from '@primer/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { RailItem, useLayoutStore } from '@primer-guidy/components-web'
import styles from './Shell.module.scss'

export const SidebarContent = () => {
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

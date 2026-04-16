import { Heading, Text, Button } from '@primer/react'
import { SidebarCollapseIcon, SidebarExpandIcon, ColumnsIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { getGreetingKey } from '@/utils/date.utils'
import { useLayoutStore } from '@/stores/layout.store'
import styles from './Home.module.scss'

export const Home = () => {
  const { t: tHome } = useTranslation('home')
  const { t: tCommon } = useTranslation('common')
  const greeting = tCommon(getGreetingKey())
  const railVisible = useLayoutStore((s) => s.railVisible)
  const toggleRail = useLayoutStore((s) => s.toggleRail)
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar)

  return (
    <div className={styles.root}>
      <Heading as="h1">{tHome('title')}</Heading>
      <Text as="p">{tHome('greeting', { greeting })}</Text>
      <div className={styles.actions}>
        <Button
          leadingVisual={railVisible ? SidebarCollapseIcon : SidebarExpandIcon}
          onClick={toggleRail}
        >
          {tHome('actions.toggleRail')}
        </Button>
        <Button leadingVisual={ColumnsIcon} onClick={toggleSidebar}>
          {tHome('actions.toggleSidebar')}
        </Button>
      </div>
    </div>
  )
}

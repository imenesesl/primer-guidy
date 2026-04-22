import { useTranslation } from 'react-i18next'
import { TabLayout } from '@primer-guidy/components-web'
import { ACTIVITY_TABS } from './Activity.utils'

export const Activity = () => {
  const { t: tActivity } = useTranslation('activity')

  return <TabLayout tabs={ACTIVITY_TABS} translate={tActivity} />
}

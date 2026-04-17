import { useTranslation } from 'react-i18next'
import { TabLayout } from '@/modules/TabLayout'
import { CHANNEL_TABS } from './Channels.utils'

export const Channels = () => {
  const { t: tChannels } = useTranslation('channels')

  return <TabLayout tabs={CHANNEL_TABS} translate={tChannels} />
}

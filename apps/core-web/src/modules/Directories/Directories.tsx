import { useTranslation } from 'react-i18next'
import { TabLayout } from '@primer-guidy/components-web'
import { DIRECTORY_TABS } from './Directories.utils'

export const Directories = () => {
  const { t: tDirectories } = useTranslation('directories')

  return <TabLayout tabs={DIRECTORY_TABS} translate={tDirectories} />
}

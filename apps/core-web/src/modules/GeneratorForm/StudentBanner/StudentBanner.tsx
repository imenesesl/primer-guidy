import { Flash, Text } from '@primer/react'
import { PeopleIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import type { StudentBannerProps } from './StudentBanner.types'
import styles from '../GeneratorForm.module.scss'

export const StudentBanner = ({ studentCount }: StudentBannerProps) => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <Flash variant="default" className={styles.banner}>
      <div className={styles.bannerContent}>
        <PeopleIcon size={16} />
        <Text as="span" className={styles.bannerText}>
          {tChannels('generator.studentCountBanner', { count: studentCount })}
        </Text>
      </div>
    </Flash>
  )
}

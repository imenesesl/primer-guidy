import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { getGreetingKey } from '@/utils/date.utils'
import styles from './Home.module.scss'

export const Home = () => {
  const { t: tHome } = useTranslation('home')
  const { t: tCommon } = useTranslation('common')
  const greeting = tCommon(getGreetingKey())

  return (
    <div className={styles.root}>
      <Heading as="h1">{tHome('title')}</Heading>
      <Text as="p">{tHome('greeting', { greeting })}</Text>
    </div>
  )
}

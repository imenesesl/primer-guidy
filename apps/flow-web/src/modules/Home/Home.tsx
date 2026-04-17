import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './Home.module.scss'

export const Home = () => {
  const { t: tHome } = useTranslation('home')

  return (
    <div className={styles.root}>
      <Heading as="h1" className={styles.title}>
        {tHome('title')}
      </Heading>
      <Text as="p" className={styles.subtitle}>
        {tHome('welcome')}
      </Text>
    </div>
  )
}

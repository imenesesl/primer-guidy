import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './Learning.module.scss'

export const Learning = () => {
  const { t: tLearning } = useTranslation('learning')

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Heading as="h1">{tLearning('title')}</Heading>
        <Text as="p">{tLearning('welcome')}</Text>
      </div>
    </div>
  )
}

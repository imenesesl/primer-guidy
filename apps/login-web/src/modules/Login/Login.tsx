import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './Login.module.scss'

export const Login = () => {
  const { t: tLogin } = useTranslation('login')

  return (
    <div className={styles.root}>
      <Heading as="h1">{tLogin('title')}</Heading>
      <Text as="p">{tLogin('subtitle')}</Text>
    </div>
  )
}

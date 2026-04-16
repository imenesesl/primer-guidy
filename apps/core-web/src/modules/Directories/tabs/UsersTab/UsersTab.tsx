import { Text, Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './UsersTab.module.scss'

export const UsersTab = () => {
  const { t: tDirectories } = useTranslation('directories')

  return (
    <div className={styles.root}>
      <Heading as="h2" className={styles.heading}>
        {tDirectories('users.title')}
      </Heading>
      <Text as="p" className={styles.description}>
        {tDirectories('users.description')}
      </Text>
    </div>
  )
}

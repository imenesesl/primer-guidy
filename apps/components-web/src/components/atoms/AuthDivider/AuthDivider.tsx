import { Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './AuthDivider.module.scss'

export const AuthDivider = () => {
  const { t: tCommon } = useTranslation('common')

  return (
    <div className={styles.root}>
      <div className={styles.line} />
      <Text as="span" className={styles.text}>
        {tCommon('or')}
      </Text>
      <div className={styles.line} />
    </div>
  )
}

import { Button, Heading, Text } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import type { LinkSentViewProps } from './LinkSentView.types'
import styles from './Login.module.scss'

export const LinkSentView = ({ onBack }: LinkSentViewProps) => {
  const { t: tLogin } = useTranslation('login')
  const { t: tCommon } = useTranslation('common')

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.linkSentCard}>
          <div className={styles.linkSentIcon}>
            <MailIcon size={32} />
          </div>
          <Heading as="h2" className={styles.heading}>
            {tLogin('linkSent.title')}
          </Heading>
          <Text as="p">{tLogin('linkSent.message')}</Text>
        </div>
        <Button onClick={onBack} className={styles.fullWidth}>
          {tCommon('actions.back')}
        </Button>
      </div>
    </div>
  )
}

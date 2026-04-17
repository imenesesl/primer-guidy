import { Button, Heading, Text } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import type { LinkSentViewProps } from './LinkSentView.types'
import styles from '@/styles/auth.module.scss'

const MAIL_ICON_SIZE = 32

export const LinkSentView = ({ onBack, namespace }: LinkSentViewProps) => {
  const { t } = useTranslation(namespace)
  const { t: tCommon } = useTranslation('common')

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.linkSentCard}>
          <div className={styles.linkSentIcon}>
            <MailIcon size={MAIL_ICON_SIZE} />
          </div>
          <Heading as="h2" className={styles.heading}>
            {t('linkSent.title')}
          </Heading>
          <Text as="p">{t('linkSent.message')}</Text>
        </div>
        <Button onClick={onBack} className={styles.fullWidth}>
          {tCommon('actions.back')}
        </Button>
      </div>
    </div>
  )
}

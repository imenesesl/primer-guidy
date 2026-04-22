import { Button, Heading, Text } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { IconSize } from '@primer-guidy/components-web'
import type { LinkSentViewProps } from './LinkSentView.types'
import authStyles from '@/styles/auth.module.scss'
import styles from './LinkSentView.module.scss'

export const LinkSentView = ({ onBack, namespace }: LinkSentViewProps) => {
  const { t: tNs } = useTranslation(namespace)
  const { t: tCommon } = useTranslation('common')

  return (
    <div className={authStyles.root}>
      <div className={authStyles.card}>
        <div className={styles.linkSentCard}>
          <div className={styles.linkSentIcon}>
            <MailIcon size={IconSize.Large} />
          </div>
          <Heading as="h2" className={authStyles.heading}>
            {tNs('linkSent.title')}
          </Heading>
          <Text as="p">{tNs('linkSent.message')}</Text>
        </div>
        <Button onClick={onBack} className={styles.fullWidth}>
          {tCommon('actions.back')}
        </Button>
      </div>
    </div>
  )
}

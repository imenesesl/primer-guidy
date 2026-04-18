import { useEffect } from 'react'
import { Dialog, Spinner, Text } from '@primer/react'
import { CopyIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useInviteCode, useGenerateInviteCode } from '@/services/invite-code'
import type { InviteStudentsDialogProps } from './InviteStudentsDialog.types'
import styles from './InviteStudentsDialog.module.scss'

export const InviteStudentsDialog = ({ isOpen, onClose }: InviteStudentsDialogProps) => {
  const { t: tDirectories } = useTranslation('directories')
  const { uid } = useCurrentUser()
  const { data: existingCode, isLoading } = useInviteCode(uid)
  const { mutate: generate, data: generatedCode, isPending } = useGenerateInviteCode()

  const code = generatedCode ?? existingCode

  useEffect(() => {
    if (isOpen && !isLoading && !existingCode && !isPending && !generatedCode) {
      generate(uid)
    }
  }, [isOpen, isLoading, existingCode, isPending, generatedCode, generate, uid])

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
    }
  }

  if (!isOpen) return null

  const isReady = !isLoading && !isPending && code

  return (
    <Dialog
      title={tDirectories('invite.title')}
      width="medium"
      onClose={() => onClose()}
      footerButtons={[
        {
          buttonType: 'default',
          content: tDirectories('invite.close'),
          onClick: onClose,
        },
        {
          buttonType: 'primary',
          content: tDirectories('invite.copyCode'),
          onClick: handleCopy,
          disabled: !isReady,
          leadingVisual: CopyIcon,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tDirectories('invite.description')}
        </Text>
        <div className={styles.codeContainer}>
          {isReady ? (
            <div className={styles.codeDisplay}>{code}</div>
          ) : (
            <div className={styles.loading}>
              <Spinner size="medium" />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}

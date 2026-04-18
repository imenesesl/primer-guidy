import { useState } from 'react'
import { Dialog, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { CodeInput } from './CodeInput'
import type { JoinWorkspaceDialogProps } from './JoinWorkspaceDialog.types'
import styles from './JoinWorkspaceDialog.module.scss'

const CODE_LENGTH = 10

export const JoinWorkspaceDialog = ({ isOpen, onClose }: JoinWorkspaceDialogProps) => {
  const { t: tShell } = useTranslation('shell')
  const [code, setCode] = useState('')

  const isValid = code.replace(/\D/g, '').length === CODE_LENGTH

  const handleClose = () => {
    setCode('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog
      title={tShell('joinWorkspace.title')}
      width="large"
      onClose={() => handleClose()}
      footerButtons={[
        {
          buttonType: 'default',
          content: tShell('joinWorkspace.cancel'),
          onClick: handleClose,
        },
        {
          buttonType: 'primary',
          content: tShell('joinWorkspace.join'),
          onClick: handleClose,
          disabled: !isValid,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tShell('joinWorkspace.description')}
        </Text>
        <CodeInput value={code} onChange={setCode} />
      </div>
    </Dialog>
  )
}

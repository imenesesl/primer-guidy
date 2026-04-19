import { useState } from 'react'
import { Dialog, Flash, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useJoinWorkspace, WorkspaceErrorCode } from '@/services/workspace'
import { CodeInput } from './CodeInput'
import type { JoinWorkspaceDialogProps } from './JoinWorkspaceDialog.types'
import { CODE_LENGTH } from './JoinWorkspaceDialog.constants'
import styles from './JoinWorkspaceDialog.module.scss'

export const JoinWorkspaceDialog = ({ isOpen, onClose, student }: JoinWorkspaceDialogProps) => {
  const { t: tShell } = useTranslation('shell')
  const [code, setCode] = useState('')
  const { mutate: join, isPending, error, reset } = useJoinWorkspace()

  const isValid = code.replace(/\D/g, '').length === CODE_LENGTH

  const handleClose = () => {
    setCode('')
    reset()
    onClose()
  }

  const handleJoin = () => {
    if (!student || !isValid) return

    join(
      {
        code,
        name: student.name,
        identificationNumber: student.identificationNumber,
      },
      { onSuccess: handleClose },
    )
  }

  if (!isOpen) return null

  const isInvalidCode = error?.message === WorkspaceErrorCode.INVALID_CODE
  const isAlreadyEnrolled = error?.message === WorkspaceErrorCode.ALREADY_ENROLLED

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
          onClick: handleJoin,
          disabled: !isValid || isPending || !student,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tShell('joinWorkspace.description')}
        </Text>
        <CodeInput value={code} onChange={setCode} />
        {isInvalidCode && <Flash variant="danger">{tShell('joinWorkspace.invalidCode')}</Flash>}
        {isAlreadyEnrolled && (
          <Flash variant="warning">{tShell('joinWorkspace.alreadyEnrolled')}</Flash>
        )}
      </div>
    </Dialog>
  )
}

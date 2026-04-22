import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Dialog, Flash, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useJoinWorkspace, WorkspaceErrorCode } from '@/services/workspace'
import { CodeInput } from './CodeInput'
import type { JoinWorkspaceDialogProps } from './JoinWorkspaceDialog.types'
import { JoinWorkspaceSchema } from './JoinWorkspaceDialog.schema'
import type { JoinWorkspaceFormData } from './JoinWorkspaceDialog.schema'
import styles from './JoinWorkspaceDialog.module.scss'

export const JoinWorkspaceDialog = ({ isOpen, onClose, student }: JoinWorkspaceDialogProps) => {
  const { t: tShell } = useTranslation('shell')
  const { mutate: join, isPending, error, reset } = useJoinWorkspace()

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { isValid },
  } = useForm<JoinWorkspaceFormData>({
    resolver: valibotResolver(JoinWorkspaceSchema),
    defaultValues: { code: '' },
    mode: 'onChange',
  })

  const handleClose = () => {
    resetForm()
    reset()
    onClose()
  }

  const onSubmit = (data: JoinWorkspaceFormData) => {
    if (!student) return

    join(
      {
        code: data.code,
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
          onClick: handleSubmit(onSubmit),
          disabled: !isValid || isPending || !student,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tShell('joinWorkspace.description')}
        </Text>
        <Controller
          name="code"
          control={control}
          render={({ field }) => <CodeInput value={field.value} onChange={field.onChange} />}
        />
        {isInvalidCode && <Flash variant="danger">{tShell('joinWorkspace.invalidCode')}</Flash>}
        {isAlreadyEnrolled && (
          <Flash variant="warning">{tShell('joinWorkspace.alreadyEnrolled')}</Flash>
        )}
      </div>
    </Dialog>
  )
}

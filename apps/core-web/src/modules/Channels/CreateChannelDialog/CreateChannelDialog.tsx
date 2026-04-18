import { useState } from 'react'
import { Dialog, TextInput, Text, Flash } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useCreateChannel } from '@/services/channel'
import type { CreateChannelDialogProps } from './CreateChannelDialog.types'
import styles from './CreateChannelDialog.module.scss'

const CHANNEL_NAME_PATTERN = /^[a-zA-Z0-9-]+$/

export const CreateChannelDialog = ({ isOpen, onClose }: CreateChannelDialogProps) => {
  const { t: tChannels } = useTranslation('channels')
  const { uid } = useCurrentUser()
  const [name, setName] = useState('')
  const { mutate: create, isPending } = useCreateChannel()

  const trimmed = name.trim()
  const isValid = trimmed.length > 0 && CHANNEL_NAME_PATTERN.test(trimmed)
  const showError = trimmed.length > 0 && !CHANNEL_NAME_PATTERN.test(trimmed)

  const handleClose = () => {
    setName('')
    onClose()
  }

  const handleCreate = () => {
    if (!isValid) return
    create({ teacherUid: uid, name: trimmed.toLowerCase() }, { onSuccess: handleClose })
  }

  if (!isOpen) return null

  return (
    <Dialog
      title={tChannels('createChannel.title')}
      width="medium"
      onClose={handleClose}
      footerButtons={[
        {
          buttonType: 'default',
          content: tChannels('createChannel.cancel'),
          onClick: handleClose,
        },
        {
          buttonType: 'primary',
          content: tChannels('createChannel.create'),
          onClick: handleCreate,
          disabled: !isValid || isPending,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tChannels('createChannel.description')}
        </Text>
        <TextInput
          placeholder={tChannels('createChannel.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        {showError && <Flash variant="danger">{tChannels('createChannel.invalidName')}</Flash>}
      </div>
    </Dialog>
  )
}

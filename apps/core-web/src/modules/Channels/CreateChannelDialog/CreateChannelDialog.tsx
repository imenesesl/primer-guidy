import { Dialog, TextInput, Text, FormControl } from '@primer/react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/context/user.context'
import { useCreateChannel, CreateChannelSchema } from '@/services/channel'
import type { CreateChannelFormData } from '@/services/channel'
import type { CreateChannelDialogProps } from './CreateChannelDialog.types'
import styles from './CreateChannelDialog.module.scss'

export const CreateChannelDialog = ({ isOpen, onClose }: CreateChannelDialogProps) => {
  const { t: tChannels } = useTranslation('channels')
  const { uid } = useCurrentUser()
  const { mutate: create, isPending } = useCreateChannel()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateChannelFormData>({
    resolver: valibotResolver(CreateChannelSchema),
    mode: 'onChange',
    defaultValues: { name: '' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: CreateChannelFormData) => {
    create({ teacherUid: uid, name: data.name.toLowerCase() }, { onSuccess: handleClose })
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
          onClick: handleSubmit(onSubmit),
          disabled: !isValid || isPending,
        },
      ]}
    >
      <div className={styles.body}>
        <Text as="p" className={styles.description}>
          {tChannels('createChannel.description')}
        </Text>
        <FormControl>
          <FormControl.Label visuallyHidden>
            {tChannels('createChannel.namePlaceholder')}
          </FormControl.Label>
          <TextInput
            placeholder={tChannels('createChannel.namePlaceholder')}
            className={styles.input}
            {...register('name')}
          />
          {errors.name && (
            <FormControl.Validation variant="error">
              {tChannels('createChannel.invalidName')}
            </FormControl.Validation>
          )}
        </FormControl>
      </div>
    </Dialog>
  )
}

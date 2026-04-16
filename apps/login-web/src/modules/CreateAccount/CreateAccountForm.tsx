import { Button, FormControl, TextInput } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import { CreateAccountSchema } from '@/services/auth'
import type { CreateAccountFormData } from '@/services/auth'
import styles from './CreateAccount.module.scss'

interface CreateAccountFormProps {
  readonly onSubmit: (data: CreateAccountFormData) => Promise<void>
  readonly disabled: boolean
}

export const CreateAccountForm = ({ onSubmit, disabled }: CreateAccountFormProps) => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: valibotResolver(CreateAccountSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <FormControl>
        <FormControl.Label className={styles.label}>
          {tCreateAccount('nameLabel')}
        </FormControl.Label>
        <TextInput {...register('name')} placeholder={tCreateAccount('namePlaceholder')} block />
        {errors.name && (
          <FormControl.Validation variant="error">
            {tCreateAccount('nameLabel')}
          </FormControl.Validation>
        )}
      </FormControl>

      <FormControl>
        <FormControl.Label className={styles.label}>
          {tCreateAccount('emailLabel')}
        </FormControl.Label>
        <TextInput
          {...register('email')}
          placeholder={tCreateAccount('emailPlaceholder')}
          type="email"
          block
        />
        {errors.email && (
          <FormControl.Validation variant="error">
            {tCreateAccount('errors.INVALID_EMAIL')}
          </FormControl.Validation>
        )}
      </FormControl>

      <Button
        type="submit"
        variant="primary"
        disabled={disabled}
        className={styles.emailButton}
        leadingVisual={MailIcon}
      >
        {tCreateAccount('createWithEmail')}
      </Button>
    </form>
  )
}

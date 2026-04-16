import { Button, FormControl, TextInput } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import type { EmailFormData } from '@/services/auth'
import { EmailSchema } from '@/services/auth'
import styles from './Login.module.scss'

interface LoginFormProps {
  readonly onSubmit: (data: EmailFormData) => Promise<void>
  readonly disabled: boolean
}

export const LoginForm = ({ onSubmit, disabled }: LoginFormProps) => {
  const { t: tLogin } = useTranslation('login')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: valibotResolver(EmailSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <FormControl>
        <FormControl.Label className={styles.label}>{tLogin('emailLabel')}</FormControl.Label>
        <TextInput
          {...register('email')}
          placeholder={tLogin('emailPlaceholder')}
          type="email"
          block
        />
        {errors.email && (
          <FormControl.Validation variant="error">
            {tLogin('errors.INVALID_EMAIL')}
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
        {tLogin('signInWithoutPassword')}
      </Button>
    </form>
  )
}

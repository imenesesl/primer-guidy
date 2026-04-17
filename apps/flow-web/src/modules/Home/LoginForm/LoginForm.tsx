import { FormControl, TextInput } from '@primer/react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import type { LoginFormData } from '@/services/auth'
import { LoginSchema } from '@/services/auth'
import { AUTH_FORM_ID, AuthTab } from '../Home.types'
import type { LoginFormProps } from './LoginForm.types'
import styles from '../Home.module.scss'

export const LoginForm = ({ onSubmit, disabled }: LoginFormProps) => {
  const { t: tHome } = useTranslation('home')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: valibotResolver(LoginSchema),
  })

  return (
    <form
      id={AUTH_FORM_ID[AuthTab.Login]}
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl disabled={disabled}>
        <FormControl.Label className={styles.label}>
          {tHome('fields.identificationNumber')}
        </FormControl.Label>
        <TextInput
          block
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          {...register('identificationNumber')}
        />
        {errors.identificationNumber && (
          <FormControl.Validation variant="error">
            {tHome('validation.identificationNumberRequired')}
          </FormControl.Validation>
        )}
      </FormControl>
      <FormControl disabled={disabled}>
        <FormControl.Label className={styles.label}>{tHome('fields.password')}</FormControl.Label>
        <TextInput block type="password" disabled={disabled} {...register('password')} />
        {errors.password && (
          <FormControl.Validation variant="error">
            {tHome('validation.passwordMinLength')}
          </FormControl.Validation>
        )}
      </FormControl>
    </form>
  )
}

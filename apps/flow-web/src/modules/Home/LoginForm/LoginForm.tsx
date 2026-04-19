import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import type { LoginFormData } from '@/services/auth'
import { LoginSchema } from '@/services/auth'
import { AUTH_FORM_ID, AuthTab } from '../Home.types'
import { AuthFormFields } from '../AuthFormFields'
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
      <AuthFormFields
        identificationNumberField={register('identificationNumber')}
        passwordField={register('password')}
        errors={errors}
        disabled={disabled}
        labels={{
          identificationNumber: tHome('fields.identificationNumber'),
          password: tHome('fields.password'),
          identificationNumberError: tHome('validation.identificationNumberRequired'),
          passwordError: tHome('validation.passwordMinLength'),
        }}
      />
    </form>
  )
}

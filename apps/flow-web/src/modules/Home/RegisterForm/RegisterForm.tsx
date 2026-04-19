import { FormControl, TextInput } from '@primer/react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import type { RegisterFormData } from '@/services/auth'
import { RegisterSchema } from '@/services/auth'
import { AUTH_FORM_ID, AuthTab } from '../Home.types'
import { AuthFormFields } from '../AuthFormFields'
import type { RegisterFormProps } from './RegisterForm.types'
import styles from '../Home.module.scss'

export const RegisterForm = ({ onSubmit, disabled }: RegisterFormProps) => {
  const { t: tHome } = useTranslation('home')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: valibotResolver(RegisterSchema),
  })

  return (
    <form
      id={AUTH_FORM_ID[AuthTab.Register]}
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
      <FormControl disabled={disabled}>
        <FormControl.Label className={styles.label}>{tHome('fields.name')}</FormControl.Label>
        <TextInput block disabled={disabled} {...register('name')} />
        {errors.name && (
          <FormControl.Validation variant="error">
            {tHome('validation.nameRequired')}
          </FormControl.Validation>
        )}
      </FormControl>
    </form>
  )
}

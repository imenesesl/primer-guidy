import { FormControl, TextInput } from '@primer/react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslation } from 'react-i18next'
import type { RegisterFormData } from '@/services/auth'
import { RegisterSchema } from '@/services/auth'
import { AUTH_FORM_ID, AuthTab } from './Home.types'
import type { RegisterFormProps } from './RegisterForm.types'
import styles from './Home.module.scss'

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
        <FormControl.Label className={styles.label}>{tHome('fields.name')}</FormControl.Label>
        <TextInput block disabled={disabled} {...register('name')} />
        {errors.name && (
          <FormControl.Validation variant="error">
            {tHome('validation.nameRequired')}
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

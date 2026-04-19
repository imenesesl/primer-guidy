import { FormControl, TextInput } from '@primer/react'
import type { AuthFormFieldsProps } from './AuthFormFields.types'
import styles from '../Home.module.scss'

export const AuthFormFields = ({
  identificationNumberField,
  passwordField,
  errors,
  disabled,
  labels,
}: AuthFormFieldsProps) => (
  <>
    <FormControl disabled={disabled}>
      <FormControl.Label className={styles.label}>{labels.identificationNumber}</FormControl.Label>
      <TextInput
        block
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        {...identificationNumberField}
      />
      {errors.identificationNumber && (
        <FormControl.Validation variant="error">
          {labels.identificationNumberError}
        </FormControl.Validation>
      )}
    </FormControl>
    <FormControl disabled={disabled}>
      <FormControl.Label className={styles.label}>{labels.password}</FormControl.Label>
      <TextInput block type="password" disabled={disabled} {...passwordField} />
      {errors.password && (
        <FormControl.Validation variant="error">{labels.passwordError}</FormControl.Validation>
      )}
    </FormControl>
  </>
)

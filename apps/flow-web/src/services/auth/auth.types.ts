import * as v from 'valibot'

const MIN_PASSWORD_LENGTH = 8
const MIN_ID_LENGTH = 8

const DIGITS_ONLY_REGEX = /^\d+$/

export const LoginSchema = v.object({
  identificationNumber: v.pipe(v.string(), v.regex(DIGITS_ONLY_REGEX), v.minLength(MIN_ID_LENGTH)),
  password: v.pipe(v.string(), v.minLength(MIN_PASSWORD_LENGTH)),
})

export type LoginFormData = v.InferOutput<typeof LoginSchema>

export const RegisterSchema = v.object({
  identificationNumber: v.pipe(v.string(), v.regex(DIGITS_ONLY_REGEX), v.minLength(MIN_ID_LENGTH)),
  name: v.pipe(v.string(), v.minLength(1)),
  password: v.pipe(v.string(), v.minLength(MIN_PASSWORD_LENGTH)),
})

export type RegisterFormData = v.InferOutput<typeof RegisterSchema>

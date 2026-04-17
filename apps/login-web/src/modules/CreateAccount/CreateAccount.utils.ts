const NAME_STORAGE_KEY = 'nameForSignUp'
const EMAIL_STORAGE_KEY = 'emailForSignUp'

export const storeSignUpData = (name: string, email: string): void => {
  localStorage.setItem(NAME_STORAGE_KEY, name)
  localStorage.setItem(EMAIL_STORAGE_KEY, email)
}

export const getStoredSignUpName = (): string | null => localStorage.getItem(NAME_STORAGE_KEY)

export const getStoredSignUpEmail = (): string | null => localStorage.getItem(EMAIL_STORAGE_KEY)

export const clearStoredSignUpData = (): void => {
  localStorage.removeItem(NAME_STORAGE_KEY)
  localStorage.removeItem(EMAIL_STORAGE_KEY)
}

export const getCreateAccountRedirectUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  return `${window.location.origin}${basePath}create-account`
}

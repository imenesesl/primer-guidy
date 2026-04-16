const EMAIL_STORAGE_KEY = 'emailForSignIn'

export const storeEmailForSignIn = (email: string): void => {
  localStorage.setItem(EMAIL_STORAGE_KEY, email)
}

export const getStoredEmailForSignIn = (): string | null => localStorage.getItem(EMAIL_STORAGE_KEY)

export const clearStoredEmailForSignIn = (): void => {
  localStorage.removeItem(EMAIL_STORAGE_KEY)
}

export const getEmailLinkRedirectUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  return `${window.location.origin}${basePath}`
}

export const getCoreAppUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  if (basePath === '/') return '/core/'
  return basePath.replace(/login\/$/, 'core/')
}

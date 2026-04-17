export const getCoreAppUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  if (basePath === '/') return '/core/'
  return basePath.replace(/login\/$/, 'core/')
}

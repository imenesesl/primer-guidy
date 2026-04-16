export const getLoginAppUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  if (basePath === '/') return '/login/'
  return basePath.replace(/core\/$/, 'login/')
}

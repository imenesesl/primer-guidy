export const getHomeUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  if (basePath === '/') return '/'
  return basePath.replace(/\/$/, '')
}

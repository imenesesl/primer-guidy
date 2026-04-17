export const getLearningUrl = (): string => {
  const basePath = (import.meta.env.BASE_PATH as string) ?? '/'
  return `${window.location.origin}${basePath}learning`
}

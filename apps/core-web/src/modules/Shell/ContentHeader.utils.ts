const BREADCRUMB_SEPARATOR = ' · '

export const buildBreadcrumb = (pathname: string, translate: (key: string) => string): string => {
  const segments = pathname.split('/').filter((segment) => segment.length > 0)

  if (segments.length === 0) {
    return translate('breadcrumb.home')
  }

  return segments.map((segment) => translate(`breadcrumb.${segment}`)).join(BREADCRUMB_SEPARATOR)
}

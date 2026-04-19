import type { BreadcrumbResolver } from './ContentHeader.types'

const resolveSegment = (
  segment: string,
  translate: (key: string) => string,
  resolver?: BreadcrumbResolver,
): string => {
  if (resolver) {
    const resolved = resolver(segment)
    if (resolved) return resolved
  }
  return translate(`breadcrumb.${segment}`)
}

export const buildBreadcrumb = (
  pathname: string,
  translate: (key: string) => string,
  resolver?: BreadcrumbResolver,
  separator = ' · ',
): string => {
  const segments = pathname.split('/').filter((segment) => segment.length > 0)

  if (segments.length === 0) {
    return translate('breadcrumb.home')
  }

  return segments.map((segment) => resolveSegment(segment, translate, resolver)).join(separator)
}

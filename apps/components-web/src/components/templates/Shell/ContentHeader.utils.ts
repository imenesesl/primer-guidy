import type { BreadcrumbResolver } from './ContentHeader.types'

const resolveSegment = (
  segment: string,
  translate: (key: string) => string,
  resolver?: BreadcrumbResolver,
): string | null => {
  if (resolver) {
    const resolved = resolver(segment)
    if (resolved) return resolved
  }
  const translated = translate(`breadcrumb.${segment}`)
  if (translated === `breadcrumb.${segment}`) return null
  return translated
}

export const buildBreadcrumb = (
  pathname: string,
  translate: (key: string) => string,
  resolver?: BreadcrumbResolver,
  separator = ' · ',
): string | null => {
  const segments = pathname.split('/').filter((segment) => segment.length > 0)

  if (segments.length === 0) {
    return translate('breadcrumb.home')
  }

  const resolved = segments.map((segment) => resolveSegment(segment, translate, resolver))
  if (resolved.some((r) => r === null)) return null
  return (resolved as string[]).join(separator)
}

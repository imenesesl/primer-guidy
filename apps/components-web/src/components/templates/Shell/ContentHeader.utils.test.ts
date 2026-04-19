import { describe, it, expect } from 'vitest'
import { buildBreadcrumb } from './ContentHeader.utils'

const translate = (key: string): string => {
  const translations: Record<string, string> = {
    'breadcrumb.home': 'Home',
    'breadcrumb.directories': 'Directories',
    'breadcrumb.users': 'Users',
    'breadcrumb.channels': 'Channels',
    'breadcrumb.tasks': 'Tasks',
    'breadcrumb.content': 'Content',
  }
  return translations[key] ?? key
}

describe('buildBreadcrumb', () => {
  it('returns Home for root path', () => {
    expect(buildBreadcrumb('/', translate)).toBe('Home')
  })

  it('returns single segment for top-level route', () => {
    expect(buildBreadcrumb('/channels', translate)).toBe('Channels')
  })

  it('joins segments with separator for nested route', () => {
    expect(buildBreadcrumb('/directories/users', translate)).toBe('Directories · Users')
  })

  it('handles empty pathname', () => {
    expect(buildBreadcrumb('', translate)).toBe('Home')
  })

  it('returns null when a segment cannot be resolved', () => {
    expect(buildBreadcrumb('/unknown', translate)).toBeNull()
  })

  it('uses resolver for dynamic segments', () => {
    const resolver = (segment: string) => {
      if (segment === 'abc123') return 'Mr. Smith'
      if (segment === 'ch456') return 'Mathematics'
      return null
    }

    expect(buildBreadcrumb('/tasks/abc123/ch456/content', translate, resolver)).toBe(
      'Tasks · Mr. Smith · Mathematics · Content',
    )
  })

  it('falls back to translate when resolver returns null', () => {
    const resolver = () => null

    expect(buildBreadcrumb('/channels', translate, resolver)).toBe('Channels')
  })

  it('uses custom separator when provided', () => {
    expect(buildBreadcrumb('/directories/users', translate, undefined, ' / ')).toBe(
      'Directories / Users',
    )
  })
})

import { describe, it, expect } from 'vitest'
import { buildBreadcrumb } from './ContentHeader.utils'

const translate = (key: string): string => {
  const translations: Record<string, string> = {
    'breadcrumb.home': 'Home',
    'breadcrumb.directories': 'Directories',
    'breadcrumb.users': 'Users',
    'breadcrumb.channels': 'Channels',
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

  it('returns translation key for unknown segments', () => {
    expect(buildBreadcrumb('/unknown', translate)).toBe('breadcrumb.unknown')
  })
})

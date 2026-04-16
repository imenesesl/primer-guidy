import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { DIRECTORY_TABS } from './Directories.utils'

describe('Directories', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'directories', {
      tabs: {
        users: 'Users',
      },
    })
  })

  it('defines tabs configuration with correct paths', () => {
    expect(DIRECTORY_TABS).toHaveLength(1)
    const firstTab = DIRECTORY_TABS[0]
    expect(firstTab?.labelKey).toBe('tabs.users')
    expect(firstTab?.path).toBe('/directories/users')
  })

  it('resolves tab labels from i18n', () => {
    const label = i18n.t('directories:tabs.users')
    expect(label).toBe('Users')
  })
})

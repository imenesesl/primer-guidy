import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { CHANNEL_TABS } from './Channels.utils'

describe('Channels', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'channels', {
      tabs: {
        general: 'General',
        announcements: 'Announcements',
      },
    })
  })

  it('defines tabs configuration with correct paths', () => {
    expect(CHANNEL_TABS).toHaveLength(2)
    const firstTab = CHANNEL_TABS[0]
    expect(firstTab?.labelKey).toBe('tabs.general')
    expect(firstTab?.path).toBe('/channels/general')

    const secondTab = CHANNEL_TABS[1]
    expect(secondTab?.labelKey).toBe('tabs.announcements')
    expect(secondTab?.path).toBe('/channels/announcements')
  })

  it('resolves tab labels from i18n', () => {
    const generalLabel = i18n.t('channels:tabs.general')
    expect(generalLabel).toBe('General')

    const announcementsLabel = i18n.t('channels:tabs.announcements')
    expect(announcementsLabel).toBe('Announcements')
  })
})

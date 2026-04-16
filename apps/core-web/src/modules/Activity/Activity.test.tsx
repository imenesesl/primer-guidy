import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { ACTIVITY_TABS } from './Activity.utils'

describe('Activity', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'activity', {
      tabs: {
        notifications: 'Notifications',
        history: 'History',
      },
    })
  })

  it('defines tabs configuration with correct paths', () => {
    expect(ACTIVITY_TABS).toHaveLength(2)
    const firstTab = ACTIVITY_TABS[0]
    expect(firstTab?.labelKey).toBe('tabs.notifications')
    expect(firstTab?.path).toBe('/activity/notifications')

    const secondTab = ACTIVITY_TABS[1]
    expect(secondTab?.labelKey).toBe('tabs.history')
    expect(secondTab?.path).toBe('/activity/history')
  })

  it('resolves tab labels from i18n', () => {
    const notificationsLabel = i18n.t('activity:tabs.notifications')
    expect(notificationsLabel).toBe('Notifications')

    const historyLabel = i18n.t('activity:tabs.history')
    expect(historyLabel).toBe('History')
  })
})

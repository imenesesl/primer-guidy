import { describe, it, expect } from 'vitest'
import { CoreRoutes, buildChannelContentPath, buildChannelAiPath } from './routes'

describe('CoreRoutes', () => {
  it('contains all expected route constants', () => {
    expect(CoreRoutes.Home).toBe('/')
    expect(CoreRoutes.Directories).toBe('/directories')
    expect(CoreRoutes.DirectoriesUsers).toBe('/directories/users')
    expect(CoreRoutes.Channels).toBe('/channels')
    expect(CoreRoutes.Activity).toBe('/activity')
    expect(CoreRoutes.ActivityNotifications).toBe('/activity/notifications')
    expect(CoreRoutes.ActivityHistory).toBe('/activity/history')
  })
})

describe('buildChannelContentPath', () => {
  it('builds correct content path', () => {
    expect(buildChannelContentPath('ch-1')).toBe('/channels/ch-1/content')
  })
})

describe('buildChannelAiPath', () => {
  it('builds correct AI path', () => {
    expect(buildChannelAiPath('ch-1')).toBe('/channels/ch-1/ai')
  })
})

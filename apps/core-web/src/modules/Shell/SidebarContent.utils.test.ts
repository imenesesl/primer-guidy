import { describe, it, expect } from 'vitest'
import type { SidebarItemConfig } from '@primer-guidy/components-web'
import { resolveSidebarItems } from './SidebarContent.utils'

const mockItem = (labelKey: string, path: string): SidebarItemConfig =>
  ({ labelKey, path, icon: {} }) as SidebarItemConfig

describe('resolveSidebarItems', () => {
  it('returns matching items for an exact key match', () => {
    const items = [mockItem('channels', '/channels')]
    const result = resolveSidebarItems('/channels', { '/channels': items })
    expect(result).toBe(items)
  })

  it('returns items for the longest prefix match', () => {
    const rootItems = [mockItem('home', '/')]
    const channelItems = [mockItem('channels', '/channels')]
    const itemsMap = {
      '/': rootItems,
      '/channels': channelItems,
    }
    const result = resolveSidebarItems('/channels/general', itemsMap)
    expect(result).toBe(channelItems)
  })

  it('falls back to root key when no other key matches', () => {
    const rootItems = [mockItem('home', '/')]
    const channelItems = [mockItem('channels', '/channels')]
    const itemsMap = {
      '/': rootItems,
      '/channels': channelItems,
    }
    const result = resolveSidebarItems('/settings', itemsMap)
    expect(result).toBe(rootItems)
  })

  it('returns empty array when no keys match', () => {
    const result = resolveSidebarItems('/anything', {})
    expect(result).toEqual([])
  })

  it('returns empty array when value for matched key is undefined', () => {
    const itemsMap = { '/test': undefined } as unknown as Record<
      string,
      readonly SidebarItemConfig[]
    >
    const result = resolveSidebarItems('/test', itemsMap)
    expect(result).toEqual([])
  })
})

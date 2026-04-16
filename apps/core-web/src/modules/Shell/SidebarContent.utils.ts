import type { SidebarItemConfig } from '@primer-guidy/components-web'

const EMPTY_ITEMS: readonly SidebarItemConfig[] = []

export const resolveSidebarItems = (
  pathname: string,
  itemsMap: Readonly<Record<string, readonly SidebarItemConfig[]>>,
): readonly SidebarItemConfig[] => {
  const sortedKeys = Object.keys(itemsMap).sort((a, b) => b.length - a.length)

  for (const key of sortedKeys) {
    if (key === '/' || pathname.startsWith(key)) {
      return itemsMap[key] ?? EMPTY_ITEMS
    }
  }

  return EMPTY_ITEMS
}

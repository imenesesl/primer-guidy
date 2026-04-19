import { ChecklistIcon, NoteIcon, BookIcon, HashIcon } from '@primer/octicons-react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'
import type { WorkspaceEntry } from '@/services/workspace'
import type { ChannelDocument } from '@/services/channel'
import { FlowRoutes } from '@/routes/routes'

type RailItemSeed = Omit<RailItemConfig, 'label'>

export const RAIL_ITEM_SEEDS: readonly RailItemSeed[] = [
  {
    icon: ChecklistIcon,
    labelKey: 'rail.items.tasks',
    path: FlowRoutes.Tasks,
    fallbackActive: true,
  },
  {
    icon: NoteIcon,
    labelKey: 'rail.items.quizes',
    path: FlowRoutes.Quizes,
  },
]

export const resolveRailItems = (
  seeds: readonly RailItemSeed[],
  translate: (key: string) => string,
): RailItemConfig[] => seeds.map((seed) => ({ ...seed, label: translate(seed.labelKey) }))

export const extractWorkspaceId = (pathname: string, basePath: string): string | null => {
  if (!pathname.startsWith(basePath)) return null
  const segments = pathname.slice(basePath.length).split('/').filter(Boolean)
  return segments[0] ?? null
}

const buildWorkspaceItems = (
  workspaces: readonly WorkspaceEntry[],
  basePath: string,
  activeWorkspaceId: string | null,
  channels: readonly ChannelDocument[] | undefined,
): SidebarItemConfig[] =>
  workspaces.map((ws) => {
    const isActive = ws.uid === activeWorkspaceId
    return {
      icon: BookIcon,
      label: ws.name,
      path: `${basePath}/${ws.uid}`,
      disabled: !ws.active,
      loading: isActive && channels === undefined,
      children: isActive
        ? channels?.map((ch) => ({
            icon: HashIcon,
            label: ch.name,
            path: `${basePath}/${ws.uid}/${ch.id}`,
            disabled: !ch.active,
          }))
        : undefined,
    }
  })

export const buildSidebarItemsMap = (
  workspaces: readonly WorkspaceEntry[],
  activeWorkspaceId: string | null,
  channels: readonly ChannelDocument[] | undefined,
): Record<string, readonly SidebarItemConfig[]> => ({
  [FlowRoutes.Tasks]: buildWorkspaceItems(
    workspaces,
    FlowRoutes.Tasks,
    activeWorkspaceId,
    channels,
  ),
  [FlowRoutes.Quizes]: buildWorkspaceItems(
    workspaces,
    FlowRoutes.Quizes,
    activeWorkspaceId,
    channels,
  ),
})

import { useCallback } from 'react'
import type { BreadcrumbResolver } from '@primer-guidy/components-web'
import type { WorkspaceEntry } from '@/services/workspace'
import type { ChannelDocument } from '@/services/channel'

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const useBreadcrumbResolver = (
  workspaces: readonly WorkspaceEntry[] | undefined,
  channels: readonly ChannelDocument[] | undefined,
): BreadcrumbResolver =>
  useCallback(
    (segment: string) => {
      const ws = workspaces?.find((w) => w.uid === segment)
      if (ws) return ws.name
      const ch = channels?.find((c) => c.id === segment)
      if (ch) return capitalize(ch.name)
      return null
    },
    [workspaces, channels],
  )

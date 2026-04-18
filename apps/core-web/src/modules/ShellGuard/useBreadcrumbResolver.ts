import { useCallback } from 'react'
import type { BreadcrumbResolver } from '@primer-guidy/components-web'
import type { ChannelDocument } from '@/services/channel'

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const useBreadcrumbResolver = (
  channels: readonly ChannelDocument[] | undefined,
): BreadcrumbResolver =>
  useCallback(
    (segment: string) => {
      const ch = channels?.find((c) => c.id === segment)
      if (ch) return capitalize(ch.name)
      return null
    },
    [channels],
  )

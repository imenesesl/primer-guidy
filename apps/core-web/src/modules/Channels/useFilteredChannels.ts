import { useMemo } from 'react'
import type { ChannelDocument } from '@/services/channel'

export const useFilteredChannels = (
  channels: ChannelDocument[] | undefined,
  search: string,
): ChannelDocument[] =>
  useMemo(() => {
    if (!channels) return []
    if (!search.trim()) return channels
    const query = search.toLowerCase()
    return channels.filter((ch) => ch.name.toLowerCase().includes(query))
  }, [channels, search])

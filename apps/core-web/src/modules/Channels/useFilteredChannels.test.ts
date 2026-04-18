import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ChannelDocument } from '@/services/channel'
import { useFilteredChannels } from './useFilteredChannels'

const mockChannels: ChannelDocument[] = [
  { id: 'ch-1', name: 'Mathematics', active: true, students: ['s1'] },
  { id: 'ch-2', name: 'Science', active: true, students: ['s1', 's2'] },
  { id: 'ch-3', name: 'History', active: false, students: [] },
]

describe('useFilteredChannels', () => {
  it('returns all channels when search is empty', () => {
    const { result } = renderHook(() => useFilteredChannels(mockChannels, ''))
    expect(result.current).toEqual(mockChannels)
  })

  it('returns empty array when channels is undefined', () => {
    const { result } = renderHook(() => useFilteredChannels(undefined, ''))
    expect(result.current).toEqual([])
  })

  it('filters channels by name (case-insensitive)', () => {
    const { result } = renderHook(() => useFilteredChannels(mockChannels, 'math'))
    expect(result.current).toHaveLength(1)
    expect(result.current.at(0)?.name).toBe('Mathematics')
  })

  it('returns empty array when no channels match', () => {
    const { result } = renderHook(() => useFilteredChannels(mockChannels, 'xyz'))
    expect(result.current).toEqual([])
  })

  it('trims whitespace from search query', () => {
    const { result } = renderHook(() => useFilteredChannels(mockChannels, '  '))
    expect(result.current).toEqual(mockChannels)
  })
})

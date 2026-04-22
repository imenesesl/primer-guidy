import { describe, it, expect } from 'vitest'
import {
  FlowRoutes,
  QUIZES_PATH_SEGMENT,
  resolveBasePath,
  buildChannelContentPath,
  buildChannelPendingPath,
} from './routes'

describe('FlowRoutes', () => {
  it('contains all expected route constants', () => {
    expect(FlowRoutes.Root).toBe('/')
    expect(FlowRoutes.Tasks).toBe('/tasks')
    expect(FlowRoutes.Quizes).toBe('/quizes')
    expect(FlowRoutes.Learning).toBe('/learning')
  })
})

describe('QUIZES_PATH_SEGMENT', () => {
  it('is the quizes path segment', () => {
    expect(QUIZES_PATH_SEGMENT).toBe('/quizes/')
  })
})

describe('resolveBasePath', () => {
  it('returns Quizes path when pathname includes quizes segment', () => {
    expect(resolveBasePath('/quizes/ws-1/ch-1')).toBe('/quizes')
  })

  it('returns Tasks path when pathname does not include quizes segment', () => {
    expect(resolveBasePath('/tasks/ws-1/ch-1')).toBe('/tasks')
  })
})

describe('buildChannelContentPath', () => {
  it('builds correct content path', () => {
    expect(buildChannelContentPath('/quizes', 'ws-1', 'ch-1')).toBe('/quizes/ws-1/ch-1/content')
  })
})

describe('buildChannelPendingPath', () => {
  it('builds correct pending path', () => {
    expect(buildChannelPendingPath('/tasks', 'ws-1', 'ch-1')).toBe('/tasks/ws-1/ch-1/pending')
  })
})

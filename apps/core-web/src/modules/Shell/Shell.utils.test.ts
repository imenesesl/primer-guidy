import { describe, it, expect } from 'vitest'
import { buildThemeVars } from './Shell.utils'

describe('buildThemeVars', () => {
  it('maps all color fields to CSS custom properties', () => {
    const colors = {
      fg: { default: '#000', muted: '#666', onEmphasis: '#fff' },
      canvas: { default: '#fff', subtle: '#f6f8fa', inset: '#f0f0f0' },
      border: { default: '#d0d7de', muted: '#d8dee4' },
      neutral: { emphasis: '#6e7781', emphasisPlus: '#24292f', muted: '#afb8c1' },
      accent: { emphasis: '#0969da', fg: '#0550ae', muted: '#ddf4ff' },
      success: { emphasis: '#1a7f37', fg: '#116329', muted: '#dafbe1' },
    }

    const result = buildThemeVars(colors)

    expect(result).toEqual(
      expect.objectContaining({
        '--primer-fg-default': '#000',
        '--primer-fg-muted': '#666',
        '--primer-fg-on-emphasis': '#fff',
        '--primer-canvas-default': '#fff',
        '--primer-canvas-subtle': '#f6f8fa',
        '--primer-canvas-inset': '#f0f0f0',
        '--primer-border-default': '#d0d7de',
        '--primer-border-muted': '#d8dee4',
        '--primer-neutral-emphasis': '#6e7781',
        '--primer-neutral-emphasis-plus': '#24292f',
        '--primer-neutral-muted': '#afb8c1',
        '--primer-accent-emphasis': '#0969da',
        '--primer-accent-fg': '#0550ae',
        '--primer-accent-muted': '#ddf4ff',
        '--primer-success-emphasis': '#1a7f37',
        '--primer-success-fg': '#116329',
        '--primer-success-muted': '#dafbe1',
      }),
    )
  })

  it('returns undefined values when colors is undefined', () => {
    const result = buildThemeVars(undefined)

    expect(result).toEqual(
      expect.objectContaining({
        '--primer-fg-default': undefined,
        '--primer-canvas-default': undefined,
        '--primer-border-default': undefined,
      }),
    )
  })

  it('handles partial color objects', () => {
    const colors = {
      fg: { default: '#000' },
    }

    const result = buildThemeVars(colors)

    expect(result).toEqual(
      expect.objectContaining({
        '--primer-fg-default': '#000',
        '--primer-fg-muted': undefined,
        '--primer-canvas-default': undefined,
      }),
    )
  })
})

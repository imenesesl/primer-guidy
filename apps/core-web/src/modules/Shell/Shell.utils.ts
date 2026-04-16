import type { CSSProperties } from 'react'

interface PrimerColors {
  readonly fg?: { readonly default?: string; readonly muted?: string; readonly onEmphasis?: string }
  readonly canvas?: { readonly default?: string; readonly subtle?: string; readonly inset?: string }
  readonly border?: { readonly default?: string; readonly muted?: string }
  readonly neutral?: {
    readonly emphasis?: string
    readonly emphasisPlus?: string
    readonly muted?: string
  }
  readonly accent?: { readonly emphasis?: string; readonly fg?: string; readonly muted?: string }
  readonly success?: { readonly emphasis?: string; readonly fg?: string; readonly muted?: string }
}

export const buildThemeVars = (colors?: PrimerColors): CSSProperties =>
  ({
    '--primer-fg-default': colors?.fg?.default,
    '--primer-fg-muted': colors?.fg?.muted,
    '--primer-fg-on-emphasis': colors?.fg?.onEmphasis,
    '--primer-canvas-default': colors?.canvas?.default,
    '--primer-canvas-subtle': colors?.canvas?.subtle,
    '--primer-canvas-inset': colors?.canvas?.inset,
    '--primer-border-default': colors?.border?.default,
    '--primer-border-muted': colors?.border?.muted,
    '--primer-neutral-emphasis': colors?.neutral?.emphasis,
    '--primer-neutral-emphasis-plus': colors?.neutral?.emphasisPlus,
    '--primer-neutral-muted': colors?.neutral?.muted,
    '--primer-accent-emphasis': colors?.accent?.emphasis,
    '--primer-accent-fg': colors?.accent?.fg,
    '--primer-accent-muted': colors?.accent?.muted,
    '--primer-success-emphasis': colors?.success?.emphasis,
    '--primer-success-fg': colors?.success?.fg,
    '--primer-success-muted': colors?.success?.muted,
  }) as CSSProperties

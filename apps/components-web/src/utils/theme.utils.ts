import type { CSSProperties } from 'react'

export interface PrimerColors {
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
  readonly danger?: { readonly emphasis?: string; readonly fg?: string; readonly muted?: string }
  readonly attention?: { readonly emphasis?: string; readonly fg?: string; readonly muted?: string }
}

const LAYOUT_VARS = {
  '--spacing-px': '1px',
  '--layout-rail-width': '4.5rem',
  '--layout-sidebar-width': '16.25rem',
  '--layout-sidebar-mobile-width': '85vw',
  '--layout-bottom-nav-height': '4.5rem',
  '--rail-label-font-size': '0.625rem',
  '--shimmer-travel': '200%',
  '--shimmer-duration': '1.5s',
  '--shimmer-opacity-min': '0.4',
  '--chat-panel-height': '85vh',
  '--chat-slide-duration': '300ms',
  '--chat-header-height': '48px',
  '--aurora-duration': '4s',
  '--aurora-bg-size': '300%',
  '--aurora-angle': '135deg',
  '--accent-border-width': '4px',
} as const

export const buildThemeVars = (colors?: PrimerColors): CSSProperties =>
  ({
    ...LAYOUT_VARS,
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
    '--primer-danger-emphasis': colors?.danger?.emphasis,
    '--primer-danger-fg': colors?.danger?.fg,
    '--primer-danger-muted': colors?.danger?.muted,
    '--primer-attention-emphasis': colors?.attention?.emphasis,
    '--primer-attention-fg': colors?.attention?.fg,
  }) as CSSProperties

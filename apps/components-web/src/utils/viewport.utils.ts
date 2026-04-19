export const MD_BREAKPOINT = '(min-width: 48rem)'

export const isDesktop = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(MD_BREAKPOINT).matches

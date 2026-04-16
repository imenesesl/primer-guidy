const MAX_INITIALS = 2
const FONT_SIZE_DIVISOR = 2

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

export const getInitialsFontSize = (size: number): number => size / FONT_SIZE_DIVISOR

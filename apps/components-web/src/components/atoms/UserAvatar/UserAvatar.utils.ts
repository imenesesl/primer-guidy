import type React from 'react'

const MAX_INITIALS = 2
const FONT_SIZE_DIVISOR = 2

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

export const toAvatarStyle = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  fontSize: size / FONT_SIZE_DIVISOR,
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@primer/react', () => ({
  useTheme: () => ({ theme: { colors: {} } }),
}))

vi.mock('../../../utils/theme.utils', () => ({
  buildThemeVars: () => ({}),
}))

import { ThemedContent } from './ThemedContent'

describe('ThemedContent', () => {
  it('renders children', () => {
    render(
      <ThemedContent>
        <span data-testid="child">Hello</span>
      </ThemedContent>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

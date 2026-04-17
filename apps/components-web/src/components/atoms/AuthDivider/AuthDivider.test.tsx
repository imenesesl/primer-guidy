import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

import { AuthDivider } from './AuthDivider'

describe('AuthDivider', () => {
  it('renders the or text', () => {
    render(<AuthDivider />)

    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('renders two divider lines', () => {
    const { container } = render(<AuthDivider />)

    const lines = container.querySelectorAll('[class*="line"]')
    const EXPECTED_LINE_COUNT = 2
    expect(lines).toHaveLength(EXPECTED_LINE_COUNT)
  })
})

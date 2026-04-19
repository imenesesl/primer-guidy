import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthDivider } from './AuthDivider'

describe('AuthDivider', () => {
  it('renders the label text', () => {
    render(<AuthDivider label="or" />)

    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('renders two divider lines', () => {
    const { container } = render(<AuthDivider label="or" />)

    const lines = container.querySelectorAll('[class*="line"]')
    const EXPECTED_LINE_COUNT = 2
    expect(lines).toHaveLength(EXPECTED_LINE_COUNT)
  })
})

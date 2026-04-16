import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GoogleIcon } from './GoogleIcon'

describe('GoogleIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<GoogleIcon />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('contains four colored paths for the Google logo', () => {
    const { container } = render(<GoogleIcon />)

    const paths = container.querySelectorAll('path')
    const GOOGLE_LOGO_PATHS = 4
    expect(paths).toHaveLength(GOOGLE_LOGO_PATHS)
  })

  it('spreads additional SVG props', () => {
    const { container } = render(<GoogleIcon data-testid="custom-icon" className="custom" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-testid', 'custom-icon')
    expect(svg).toHaveClass('custom')
  })
})

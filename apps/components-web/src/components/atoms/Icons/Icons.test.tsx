import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GoogleIcon } from './GoogleIcon'

const EXPECTED_GOOGLE_PATH_COUNT = 4

describe('GoogleIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<GoogleIcon />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('contains four colored paths for the Google logo', () => {
    const { container } = render(<GoogleIcon />)

    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(EXPECTED_GOOGLE_PATH_COUNT)
  })

  it('spreads additional SVG props', () => {
    const { container } = render(<GoogleIcon data-testid="custom-icon" className="custom" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-testid', 'custom-icon')
    expect(svg).toHaveClass('custom')
  })
})

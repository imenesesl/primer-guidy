import { render } from '@testing-library/react'
import { ContentSkeleton } from './ContentSkeleton'

vi.mock('./ContentSkeleton.module.scss', () => ({
  default: {
    root: 'root',
    avatar: 'avatar',
    line: 'line',
    lineWide: 'lineWide',
    lineNarrow: 'lineNarrow',
    lineShort: 'lineShort',
  },
}))

describe('ContentSkeleton', () => {
  it('renders the skeleton container', () => {
    const { container } = render(<ContentSkeleton />)

    expect(container.querySelector('.root')).toBeInTheDocument()
  })

  it('renders an avatar placeholder', () => {
    const { container } = render(<ContentSkeleton />)

    expect(container.querySelector('.avatar')).toBeInTheDocument()
  })

  it('renders three skeleton lines', () => {
    const { container } = render(<ContentSkeleton />)

    const lines = container.querySelectorAll('.line')
    const EXPECTED_LINE_COUNT = 3

    expect(lines).toHaveLength(EXPECTED_LINE_COUNT)
  })
})

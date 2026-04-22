import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key} ${JSON.stringify(opts)}` : key,
  }),
}))

import { StudentBanner } from './StudentBanner'

describe('StudentBanner', () => {
  it('renders the student count text', () => {
    render(<StudentBanner studentCount={5} />)
    expect(screen.getByText(/generator\.studentCountBanner/)).toBeInTheDocument()
  })

  it('renders PeopleIcon', () => {
    const { container } = render(<StudentBanner studentCount={3} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import { CreatingView } from './CreatingView'

describe('CreatingView', () => {
  it('renders the spinner', () => {
    render(<CreatingView />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders the creating-account text', () => {
    render(<CreatingView />)

    expect(screen.getByText('creatingAccount')).toBeInTheDocument()
  })
})

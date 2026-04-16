import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import { VerifyingView } from './VerifyingView'

describe('VerifyingView', () => {
  it('renders the spinner', () => {
    render(<VerifyingView />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders the verifying text', () => {
    render(<VerifyingView />)

    expect(screen.getByText('verifying')).toBeInTheDocument()
  })
})

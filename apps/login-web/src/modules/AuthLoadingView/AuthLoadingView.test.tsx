import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthLoadingView } from './AuthLoadingView'

describe('AuthLoadingView', () => {
  it('renders the spinner', () => {
    render(<AuthLoadingView message="Loading account..." />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders the provided message', () => {
    render(<AuthLoadingView message="Please wait" />)

    expect(screen.getByText('Please wait')).toBeInTheDocument()
  })
})

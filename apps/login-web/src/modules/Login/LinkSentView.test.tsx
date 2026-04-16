import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import { LinkSentView } from './LinkSentView'

describe('LinkSentView', () => {
  it('renders the link-sent heading', () => {
    render(<LinkSentView onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'linkSent.title' })).toBeInTheDocument()
  })

  it('renders the link-sent message', () => {
    render(<LinkSentView onBack={vi.fn()} />)

    expect(screen.getByText('linkSent.message')).toBeInTheDocument()
  })

  it('renders the back button', () => {
    render(<LinkSentView onBack={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'actions.back' })).toBeInTheDocument()
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const handleBack = vi.fn()

    render(<LinkSentView onBack={handleBack} />)

    await user.click(screen.getByRole('button', { name: 'actions.back' }))

    expect(handleBack).toHaveBeenCalledOnce()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { JoinWorkspaceDialog } from './JoinWorkspaceDialog'

describe('JoinWorkspaceDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<JoinWorkspaceDialog isOpen={false} onClose={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog when open', () => {
    render(<JoinWorkspaceDialog isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders 10 digit inputs', () => {
    render(<JoinWorkspaceDialog isOpen={true} onClose={vi.fn()} />)
    const inputs = Array.from({ length: 10 }, (_, i) => screen.getByLabelText(`Digit ${i + 1}`))
    expect(inputs).toHaveLength(10)
  })

  it('join button is disabled when code is incomplete', () => {
    render(<JoinWorkspaceDialog isOpen={true} onClose={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    const joinButton = buttons.find((btn) => btn.textContent === 'joinWorkspace.join')
    expect(joinButton).toBeDisabled()
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<JoinWorkspaceDialog isOpen={true} onClose={onClose} />)

    const buttons = screen.getAllByRole('button')
    const cancelButton = buttons.find(
      (btn) => btn.textContent === 'joinWorkspace.cancel',
    ) as HTMLElement
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })
})

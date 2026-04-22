import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key} ${JSON.stringify(opts)}` : key,
  }),
}))

import { ChannelCard } from './ChannelCard'

const baseProps = {
  name: 'Math 101',
  studentCount: 12,
  active: true,
  onToggle: vi.fn(),
  onManageStudents: vi.fn(),
  isToggling: false,
}

describe('ChannelCard', () => {
  it('renders the channel name', () => {
    render(<ChannelCard {...baseProps} />)
    expect(screen.getByText('Math 101')).toBeInTheDocument()
  })

  it('renders the student count', () => {
    render(<ChannelCard {...baseProps} />)
    expect(screen.getByText(/channelCard\.students/)).toBeInTheDocument()
  })

  it('calls onManageStudents when manage button is clicked', () => {
    const onManageStudents = vi.fn()
    render(<ChannelCard {...baseProps} onManageStudents={onManageStudents} />)
    fireEvent.click(screen.getByText('channelCard.manage'))
    expect(onManageStudents).toHaveBeenCalledOnce()
  })

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = vi.fn()
    render(<ChannelCard {...baseProps} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('channelCard.deactivate'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('disables toggle button when isToggling is true', () => {
    render(<ChannelCard {...baseProps} isToggling={true} />)
    const btn = screen.getByText('channelCard.deactivate').closest('button')
    expect(btn).toBeDisabled()
  })

  it('shows deactivate when active', () => {
    render(<ChannelCard {...baseProps} active={true} />)
    expect(screen.getByText('channelCard.deactivate')).toBeInTheDocument()
  })

  it('shows activate when inactive', () => {
    render(<ChannelCard {...baseProps} active={false} />)
    expect(screen.getByText('channelCard.activate')).toBeInTheDocument()
  })
})

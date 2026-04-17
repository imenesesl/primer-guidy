import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithRouter } from '../../../test/render-with-router'
import { RailItem } from './RailItem'

const MockIcon = vi.fn(() => <svg data-testid="default-icon" />)
const MockActiveIcon = vi.fn(() => <svg data-testid="active-icon" />)

describe('RailItem — navigation variant', () => {
  it('renders the icon and label', async () => {
    renderWithRouter(<RailItem icon={MockIcon} label="Home" path="/" active={false} />)

    expect(await screen.findByTestId('default-icon')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders as a link to the given path', async () => {
    renderWithRouter(<RailItem icon={MockIcon} label="Home" path="/" active={false} />)

    const link = await screen.findByRole('link', { name: /home/i })
    expect(link).toBeInTheDocument()
  })

  it('applies active style class when active', async () => {
    renderWithRouter(<RailItem icon={MockIcon} label="Home" path="/" active />)

    const link = await screen.findByRole('link', { name: /home/i })
    expect(link.className).toContain('active')
  })

  it('does not apply active style class when not active', async () => {
    renderWithRouter(<RailItem icon={MockIcon} label="Home" path="/" active={false} />)

    const link = await screen.findByRole('link', { name: /home/i })
    expect(link.className).not.toContain('active')
  })

  it('renders the default icon when inactive even if activeIcon is provided', async () => {
    renderWithRouter(
      <RailItem icon={MockIcon} activeIcon={MockActiveIcon} label="Home" path="/" active={false} />,
    )

    expect(await screen.findByTestId('default-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('active-icon')).not.toBeInTheDocument()
  })

  it('renders the activeIcon when active and activeIcon is provided', async () => {
    renderWithRouter(
      <RailItem icon={MockIcon} activeIcon={MockActiveIcon} label="Home" path="/" active />,
    )

    expect(await screen.findByTestId('active-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('default-icon')).not.toBeInTheDocument()
  })

  it('falls back to default icon when active but no activeIcon is provided', async () => {
    renderWithRouter(<RailItem icon={MockIcon} label="Home" path="/" active />)

    expect(await screen.findByTestId('default-icon')).toBeInTheDocument()
  })
})

describe('RailItem — action variant', () => {
  it('renders as a button with the icon', () => {
    render(<RailItem variant="action" icon={MockIcon} aria-label="Toggle" onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument()
    expect(screen.getByTestId('default-icon')).toBeInTheDocument()
  })

  it('does not render a label or link', () => {
    render(<RailItem variant="action" icon={MockIcon} aria-label="Toggle" onClick={vi.fn()} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<RailItem variant="action" icon={MockIcon} aria-label="Toggle" onClick={handleClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})

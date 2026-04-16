import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UserAvatar } from './UserAvatar'

describe('UserAvatar', () => {
  it('renders image when src is provided', () => {
    render(<UserAvatar name="Jane Doe" src="https://example.com/avatar.jpg" />)

    const img = screen.getByRole('img', { name: 'Jane Doe' })
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders initials when src is not provided', () => {
    render(<UserAvatar name="Jane Doe" />)

    const avatar = screen.getByRole('img', { name: 'Jane Doe' })
    expect(avatar).toHaveTextContent('JD')
  })

  it('renders single initial for single-word name', () => {
    render(<UserAvatar name="Jane" />)

    expect(screen.getByRole('img', { name: 'Jane' })).toHaveTextContent('J')
  })

  it('limits initials to two characters', () => {
    render(<UserAvatar name="John Michael Doe" />)

    expect(screen.getByRole('img', { name: 'John Michael Doe' })).toHaveTextContent('JM')
  })

  it('renders initials when src is undefined', () => {
    render(<UserAvatar name="Ana" src={undefined} />)

    expect(screen.getByRole('img', { name: 'Ana' })).toHaveTextContent('A')
  })
})

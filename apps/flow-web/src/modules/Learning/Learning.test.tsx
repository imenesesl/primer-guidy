import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./Learning.module.scss', () => ({
  default: { root: 'root', card: 'card' },
}))

import { Learning } from './Learning'

describe('Learning', () => {
  it('renders the learning title', () => {
    render(<Learning studentName="Alice" />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders welcome text', () => {
    render(<Learning studentName="Alice" />)

    expect(screen.getByText('welcome')).toBeInTheDocument()
  })
})

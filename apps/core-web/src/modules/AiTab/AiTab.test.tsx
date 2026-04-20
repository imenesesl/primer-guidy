import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./AiTab.module.scss', () => ({
  default: { root: 'root' },
}))

import { AiTab } from './AiTab'

describe('AiTab', () => {
  it('renders AI heading', () => {
    render(<AiTab />)

    expect(screen.getByRole('heading', { name: 'channelTabs.ai' })).toBeInTheDocument()
  })
})

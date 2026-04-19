import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: { root: 'root' },
}))

import { ContentTab } from './ContentTab'

describe('ContentTab', () => {
  it('renders content heading', () => {
    render(<ContentTab />)

    expect(screen.getByRole('heading', { name: 'channelTabs.content' })).toBeInTheDocument()
  })
})

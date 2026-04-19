import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ channelId: 'ch-123' }),
}))

vi.mock('./ChannelDetail.module.scss', () => ({
  default: { root: 'root' },
}))

import { ChannelDetail } from './ChannelDetail'

describe('ChannelDetail', () => {
  it('renders channel detail text', () => {
    render(<ChannelDetail />)

    expect(screen.getByText('channelDetail.title')).toBeInTheDocument()
  })
})

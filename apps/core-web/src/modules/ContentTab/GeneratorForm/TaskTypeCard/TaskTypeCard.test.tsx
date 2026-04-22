import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/services/generator', () => ({
  TASK_KINDS: ['quiz', 'homework'],
}))

vi.mock('react-hook-form', () => ({
  Controller: ({
    render: renderProp,
  }: {
    render: (args: { field: { value: string; onChange: () => void } }) => React.ReactNode
  }) => renderProp({ field: { value: 'quiz', onChange: vi.fn() } }),
}))

import { TaskTypeCard } from './TaskTypeCard'

const mockControl = {} as never

describe('TaskTypeCard', () => {
  it('renders the task type title', () => {
    render(<TaskTypeCard control={mockControl} />)
    expect(screen.getByText('generator.taskType')).toBeInTheDocument()
  })

  it('renders all task kind options', () => {
    render(<TaskTypeCard control={mockControl} />)
    expect(screen.getByText('generator.kinds.quiz')).toBeInTheDocument()
    expect(screen.getByText('generator.kinds.homework')).toBeInTheDocument()
  })
})

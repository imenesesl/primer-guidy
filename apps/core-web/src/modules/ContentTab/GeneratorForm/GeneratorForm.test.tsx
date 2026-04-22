import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./GeneratorForm.module.scss', () => ({
  default: {
    overlay: 'overlay',
    body: 'body',
    card: 'card',
    cardHeader: 'cardHeader',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    banner: 'banner',
    bannerContent: 'bannerContent',
    bannerText: 'bannerText',
    fieldGroup: 'fieldGroup',
    divider: 'divider',
    checkboxLabel: 'checkboxLabel',
    charCounter: 'charCounter',
  },
}))

vi.mock('../GeneratorForm/GeneratorForm.module.scss', () => ({
  default: {
    overlay: 'overlay',
    body: 'body',
    card: 'card',
    cardHeader: 'cardHeader',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    banner: 'banner',
    bannerContent: 'bannerContent',
    bannerText: 'bannerText',
    fieldGroup: 'fieldGroup',
    divider: 'divider',
    checkboxLabel: 'checkboxLabel',
    charCounter: 'charCounter',
  },
}))

import { GeneratorForm } from './GeneratorForm'

const noop = () => {}

describe('GeneratorForm', () => {
  it('does not render when closed', () => {
    const { baseElement } = render(
      <GeneratorForm
        isOpen={false}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    expect(baseElement.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders task type segmented control when open', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    expect(screen.getByText('generator.kinds.quiz')).toBeInTheDocument()
    expect(screen.getByText('generator.kinds.homework')).toBeInTheDocument()
  })

  it('renders prompt and context cards', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    expect(screen.getAllByText('generator.prompt').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('generator.context').length).toBeGreaterThanOrEqual(1)
  })

  it('displays student count in banner', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={Array.from({ length: 25 }, (_, i) => `STU-${String(i + 1).padStart(3, '0')}`)}
        onSubmit={noop}
      />,
    )
    expect(screen.getByText('generator.studentCountBanner')).toBeInTheDocument()
  })

  it('does not render homework options when quiz is selected', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    expect(screen.queryByText('generator.homeworkOptions')).not.toBeInTheDocument()
  })

  it('shows homework options when homework is selected', async () => {
    const user = userEvent.setup()
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )

    await user.click(screen.getByText('generator.kinds.homework'))

    expect(screen.getByText('generator.homeworkOptions')).toBeInTheDocument()
    expect(screen.getByText('generator.questionCount')).toBeInTheDocument()
    expect(screen.getByText('generator.openQuestion')).toBeInTheDocument()
  })

  it('renders dialog footer buttons', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    expect(screen.getByText('generator.cancel')).toBeInTheDocument()
    expect(screen.getByText('generator.generate')).toBeInTheDocument()
  })

  it('disables generate button when form is invalid', () => {
    render(
      <GeneratorForm
        isOpen={true}
        onClose={noop}
        students={['STU-001', 'STU-002', 'STU-003']}
        onSubmit={noop}
      />,
    )
    const generateBtn = screen.getByText('generator.generate').closest('button')
    expect(generateBtn).toBeDisabled()
  })
})

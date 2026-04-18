import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CodeInput } from './CodeInput'

const getInputs = () =>
  Array.from({ length: 10 }, (_, i) => screen.getByLabelText(`Digit ${i + 1}`))

const getFirstInput = () => screen.getByLabelText('Digit 1')

describe('CodeInput', () => {
  it('renders 10 input boxes', () => {
    render(<CodeInput value="" onChange={vi.fn()} />)
    expect(getInputs()).toHaveLength(10)
  })

  it('displays digits from value prop', () => {
    render(<CodeInput value="1234567890" onChange={vi.fn()} />)
    const inputs = getInputs()
    expect(inputs[0]).toHaveValue('1')
    expect(inputs[9]).toHaveValue('0')
  })

  it('calls onChange when typing a digit', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CodeInput value="" onChange={onChange} />)

    await user.click(getFirstInput())
    await user.keyboard('5')

    expect(onChange).toHaveBeenCalledWith('5')
  })

  it('handles paste of a full code', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CodeInput value="" onChange={onChange} />)

    await user.click(getFirstInput())
    await user.paste('1234567890')

    expect(onChange).toHaveBeenCalledWith('1234567890')
  })

  it('filters non-numeric characters from paste', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CodeInput value="" onChange={onChange} />)

    await user.click(getFirstInput())
    await user.paste('12ab34cd56')

    expect(onChange).toHaveBeenCalledWith('123456')
  })
})

import { useRef, useCallback } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { TextInput } from '@primer/react'
import type { CodeInputProps } from './CodeInput.types'
import styles from './JoinWorkspaceDialog.module.scss'

const CODE_LENGTH = 10

export const CodeInput = ({ value, onChange }: CodeInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '')

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus()
  }, [])

  const updateDigit = useCallback(
    (index: number, digit: string) => {
      const next = digits.slice()
      next[index] = digit
      onChange(next.join(''))
    },
    [digits, onChange],
  )

  const handleInput = useCallback(
    (index: number, char: string) => {
      if (!/^\d$/.test(char)) return
      updateDigit(index, char)
      if (index < CODE_LENGTH - 1) focusInput(index + 1)
    },
    [updateDigit, focusInput],
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (digits[index]?.trim()) {
          updateDigit(index, '')
        } else if (index > 0) {
          updateDigit(index - 1, '')
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
        focusInput(index + 1)
      }
    },
    [digits, updateDigit, focusInput],
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
      onChange(pasted)
      const lastIndex = Math.min(pasted.length, CODE_LENGTH - 1)
      focusInput(lastIndex)
    },
    [onChange, focusInput],
  )

  return (
    <div className={styles.codeInputRoot}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el: HTMLInputElement | null) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          className={styles.codeBox}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}

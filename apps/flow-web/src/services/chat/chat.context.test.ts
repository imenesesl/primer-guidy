import { describe, it, expect } from 'vitest'
import { formatOptions, buildEnrichedContext, buildInitialPrompt } from './chat.context'
import type { QuizContext } from './chat.types'

const makeQuiz = (overrides: Partial<QuizContext> = {}): QuizContext => ({
  topic: 'JavaScript Basics',
  statement: 'What keyword declares a variable?',
  options: ['var', 'let', 'const', 'all of the above'],
  correctIndex: 3,
  selectedIndex: 1,
  ...overrides,
})

describe('formatOptions', () => {
  it('labels each option with a letter', () => {
    const result = formatOptions(['Alpha', 'Beta'], 0, 1)

    expect(result).toContain('A) Alpha')
    expect(result).toContain('B) Beta')
  })

  it('marks the correct option', () => {
    const result = formatOptions(['Alpha', 'Beta'], 0, 1)

    expect(result).toContain('A) Alpha ← correct')
  })

  it('marks the student choice', () => {
    const result = formatOptions(['Alpha', 'Beta'], 0, 1)

    expect(result).toContain('B) Beta ← student choice')
  })

  it('marks both correct and student choice on the same option', () => {
    const result = formatOptions(['Alpha', 'Beta'], 0, 0)

    expect(result).toContain('A) Alpha ← correct, student choice')
  })

  it('adds no marker to unrelated options', () => {
    const result = formatOptions(['Alpha', 'Beta', 'Gamma'], 0, 1)

    expect(result).toContain('C) Gamma')
    expect(result).not.toContain('C) Gamma ←')
  })
})

describe('buildEnrichedContext', () => {
  it('includes topic, question, and options', () => {
    const result = buildEnrichedContext(makeQuiz())

    expect(result).toContain('Topic: JavaScript Basics')
    expect(result).toContain('Question: What keyword declares a variable?')
    expect(result).toContain('Options:')
  })

  it('indicates incorrect answer when student is wrong', () => {
    const result = buildEnrichedContext(makeQuiz({ selectedIndex: 1, correctIndex: 3 }))

    expect(result).toContain('Student answered: incorrectly')
  })

  it('indicates correct answer when student is right', () => {
    const result = buildEnrichedContext(makeQuiz({ selectedIndex: 3, correctIndex: 3 }))

    expect(result).toContain('Student answered: correctly')
  })

  it('includes explanation when provided', () => {
    const result = buildEnrichedContext(makeQuiz({ explanation: 'All three keywords work.' }))

    expect(result).toContain('Explanation: All three keywords work.')
  })

  it('omits explanation section when not provided', () => {
    const result = buildEnrichedContext(makeQuiz({ explanation: undefined }))

    expect(result).not.toContain('Explanation:')
  })

  it('includes Socratic guidance instructions', () => {
    const result = buildEnrichedContext(makeQuiz())

    expect(result).toContain('Do not reveal the correct answer directly')
  })
})

describe('buildInitialPrompt', () => {
  it('returns a correct-answer prompt when student answered correctly', () => {
    const result = buildInitialPrompt(makeQuiz({ selectedIndex: 3, correctIndex: 3 }))

    expect(result).toContain('answered correctly')
    expect(result).toContain('how they arrived')
  })

  it('returns an incorrect-answer prompt when student answered incorrectly', () => {
    const result = buildInitialPrompt(makeQuiz({ selectedIndex: 1, correctIndex: 3 }))

    expect(result).toContain('answered incorrectly')
    expect(result).toContain('guide them toward the correct reasoning')
  })
})

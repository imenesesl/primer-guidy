import type { QuizContext } from './chat.types'

const LETTER_OFFSET = 'A'.charCodeAt(0)

export const formatOptions = (
  options: readonly string[],
  correctIdx: number,
  selectedIdx: number,
): string =>
  options
    .map((opt, i) => {
      const letter = String.fromCharCode(LETTER_OFFSET + i)
      const markers: string[] = []
      if (i === correctIdx) markers.push('correct')
      if (i === selectedIdx) markers.push('student choice')
      const suffix = markers.length > 0 ? ` ← ${markers.join(', ')}` : ''
      return `  ${letter}) ${opt}${suffix}`
    })
    .join('\n')

export const buildEnrichedContext = (quiz: QuizContext): string => {
  const isCorrect = quiz.selectedIndex === quiz.correctIndex
  const sections = [
    `Topic: ${quiz.topic}`,
    `Question: ${quiz.statement}`,
    `Options:\n${formatOptions(quiz.options, quiz.correctIndex, quiz.selectedIndex)}`,
    `Student answered: ${isCorrect ? 'correctly' : 'incorrectly'}`,
  ]

  if (quiz.explanation) {
    sections.push(`Explanation: ${quiz.explanation}`)
  }

  sections.push(
    'Use this context to guide the student. Do not reveal the correct answer directly; help them understand why their choice is right or wrong through questions and hints.',
  )

  return sections.join('\n\n')
}

export const buildInitialPrompt = (quiz: QuizContext): string => {
  const isCorrect = quiz.selectedIndex === quiz.correctIndex
  if (isCorrect) {
    return 'The student answered correctly. Ask them how they arrived at the answer and reinforce their understanding of the concept.'
  }
  return 'The student answered incorrectly. Help them understand why their choice is wrong and guide them toward the correct reasoning without revealing the answer directly.'
}

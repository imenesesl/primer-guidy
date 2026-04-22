import type { QuestionData } from '@/services/content'

export enum OptionState {
  Idle = 'idle',
  Selected = 'selected',
  Dimmed = 'dimmed',
}

export interface QuizGuide {
  readonly topic?: string
  readonly keyConcepts?: readonly string[]
}

export interface QuizPlayerProps {
  readonly question: QuestionData
  readonly guide: QuizGuide
  readonly answered: boolean
  readonly selectedIndex: number | null
  readonly previousSelectedIndex: number | null
  readonly onAnswer: (index: number) => void
}

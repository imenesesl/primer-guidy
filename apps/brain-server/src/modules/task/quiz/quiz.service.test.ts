import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { QuizService } from './quiz.service'
import type { TaskGuideService, GuideResult } from '../shared/task-guide.service'
import type { StudentContentDto } from '@primer-guidy/nest-shared'
import { QUIZ_CONTENT_PROMPT } from '../../../prompts'
import { QuizSchema } from './schemas/quiz.schema'

const mockGenerateGuide = vi.fn()
const mockGenerateStudents = vi.fn()

const mockTaskGuide = {
  generateGuide: mockGenerateGuide,
  generateStudents: mockGenerateStudents,
} as unknown as TaskGuideService

const GUIDE_RESULT: GuideResult = {
  guide: { topic: 'algebra', keyConcepts: ['equations'] },
  model: 'llama3.1:8b',
}

const STUDENT_CONTENTS: StudentContentDto[] = [
  {
    identificationNumber: 'STU-001',
    questions: [
      {
        id: 'q1',
        statement: 'What is x?',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'x=3',
      },
    ],
    chatContext: 'Basic algebra quiz covering linear equations.',
    metrics: { durationMs: 200, promptTokens: 50, completionTokens: 100, totalTokens: 150 },
  },
  {
    identificationNumber: 'STU-002',
    questions: [
      {
        id: 'q1',
        statement: 'Solve 2x=6?',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'x=3',
      },
    ],
    chatContext: 'Basic algebra quiz covering linear equations.',
    metrics: { durationMs: 200, promptTokens: 50, completionTokens: 100, totalTokens: 150 },
  },
]

describe('QuizService', () => {
  let service: QuizService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new QuizService(mockTaskGuide)
    collector = new MetricsCollector()
  })

  it('generates guide then students and returns combined result', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce(STUDENT_CONTENTS)

    const result = await service.generate(
      { prompt: 'linear equations', context: 'algebra', students: ['STU-001', 'STU-002'] },
      collector,
    )

    expect(result.guide).toEqual(GUIDE_RESULT.guide)
    expect(result.model).toBe('llama3.1:8b')
    expect(result.studentContents).toHaveLength(2)
  })

  it('always uses questionCount=1 and QuizSchema', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([STUDENT_CONTENTS[0]])

    await service.generate({ prompt: 'p', context: 'c', students: ['STU-001'] }, collector)

    const config = mockGenerateStudents.mock.calls[0][0]
    expect(config.questionCount).toBe(1)
    expect(config.systemPromptTemplate).toBe(QUIZ_CONTENT_PROMPT)
    expect(config.schema).toBe(QuizSchema)
  })

  it('passes prompt and context to both guide and students', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([])

    await service.generate(
      { prompt: 'Newton', context: 'physics', students: ['STU-001'] },
      collector,
    )

    expect(mockGenerateGuide).toHaveBeenCalledWith('Newton', 'physics', 'es', collector)
    const config = mockGenerateStudents.mock.calls[0][0]
    expect(config.prompt).toBe('Newton')
    expect(config.context).toBe('physics')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { HomeworkService } from './homework.service'
import type { TaskGuideService, GuideResult } from '../shared/task-guide.service'
import type { StudentContentDto } from '@primer-guidy/nest-shared'
import { HOMEWORK_MC_PROMPT, HOMEWORK_OPEN_PROMPT } from '../../../prompts'
import { HomeworkMultipleChoiceSchema, HomeworkOpenSchema } from './schemas/homework.schema'

const mockGenerateGuide = vi.fn()
const mockGenerateStudents = vi.fn()

const mockTaskGuide = {
  generateGuide: mockGenerateGuide,
  generateStudents: mockGenerateStudents,
} as unknown as TaskGuideService

const GUIDE_RESULT: GuideResult = {
  guide: { topic: 'calculus', keyConcepts: ['derivatives'] },
  model: 'llama3.1:8b',
}

const MC_STUDENT: StudentContentDto = {
  identificationNumber: 'STU-001',
  questions: [
    {
      id: 'q1',
      statement: 'Solve 2x=6?',
      options: ['2', '3', '4', '5'],
      correctIndex: 1,
      explanation: 'x=3',
    },
  ],
  chatContext: 'Homework covering basic linear equations solving.',
  metrics: { durationMs: 200, promptTokens: 50, completionTokens: 100, totalTokens: 150 },
}

const OPEN_STUDENT: StudentContentDto = {
  identificationNumber: 'STU-001',
  questions: [
    {
      id: 'q1',
      statement: 'Explain differentiation.',
      expectedAnswerHints: ['rate of change', 'slope'],
    },
  ],
  chatContext: 'Homework covering basic differentiation concepts.',
  metrics: { durationMs: 200, promptTokens: 50, completionTokens: 100, totalTokens: 150 },
}

describe('HomeworkService', () => {
  let service: HomeworkService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new HomeworkService(mockTaskGuide)
    collector = new MetricsCollector()
  })

  it('generates guide then MC students by default', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([MC_STUDENT])

    const result = await service.generate(
      { prompt: 'equations', context: 'algebra', students: ['STU-001'], questionCount: 3 },
      collector,
    )

    expect(result.guide).toEqual(GUIDE_RESULT.guide)
    expect(result.model).toBe('llama3.1:8b')
    expect(result.studentContents).toHaveLength(1)

    const config = mockGenerateStudents.mock.calls[0][0]
    expect(config.questionCount).toBe(3)
    expect(config.systemPromptTemplate).toBe(HOMEWORK_MC_PROMPT)
    expect(config.schema).toBe(HomeworkMultipleChoiceSchema)
  })

  it('uses open-ended schema and prompt when openQuestion=true', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([OPEN_STUDENT])

    await service.generate(
      { prompt: 'p', context: 'c', students: ['STU-001'], questionCount: 2, openQuestion: true },
      collector,
    )

    const config = mockGenerateStudents.mock.calls[0][0]
    expect(config.systemPromptTemplate).toBe(HOMEWORK_OPEN_PROMPT)
    expect(config.schema).toBe(HomeworkOpenSchema)
  })

  it('defaults questionCount to 5 when not provided', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([])

    await service.generate({ prompt: 'p', context: 'c', students: ['STU-001'] }, collector)

    const config = mockGenerateStudents.mock.calls[0][0]
    expect(config.questionCount).toBe(5)
  })

  it('passes prompt and context to guide generation', async () => {
    mockGenerateGuide.mockResolvedValueOnce(GUIDE_RESULT)
    mockGenerateStudents.mockResolvedValueOnce([])

    await service.generate(
      { prompt: 'derivatives', context: 'calculus', students: ['STU-001'] },
      collector,
    )

    expect(mockGenerateGuide).toHaveBeenCalledWith('derivatives', 'calculus', collector)
  })
})

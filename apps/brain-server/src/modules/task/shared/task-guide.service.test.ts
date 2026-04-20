import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { HttpException } from '@nestjs/common'
import type { ILlmProvider, CompletionResult } from '@primer-guidy/llm-services'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { z } from 'zod'
import { MetricsStep, studentStep } from '../../../constants'
import { TaskGuideService } from './task-guide.service'

const mockComplete = vi.fn<() => Promise<CompletionResult>>()
const mockProvider: ILlmProvider = { complete: mockComplete }

const GUIDE_JSON = JSON.stringify({
  topic: 'algebra',
  keyConceptCount: 2,
  keyConcepts: ['linear equations', 'quadratic equations'],
  rubric: 'solve correctly with shown work',
})

const QUIZ_JSON = JSON.stringify({
  questions: [
    {
      id: 'q1',
      statement: 'What is the solution of x + 2 = 5?',
      options: ['1', '2', '3', '4'],
      correctIndex: 2,
      explanation: 'x = 5 - 2 = 3',
    },
  ],
  chatContext: 'This quiz covers basic linear equations with single variable solving.',
})

const TestSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string(),
        statement: z.string().min(10),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string(),
      }),
    )
    .length(1),
  chatContext: z.string().min(20),
})

const makeResult = (content: string): CompletionResult => ({
  content,
  model: 'llama3.1:8b',
  usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
  durationMs: 200,
})

describe('TaskGuideService', () => {
  let service: TaskGuideService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TaskGuideService(mockProvider)
    collector = new MetricsCollector()
  })

  describe('generateGuide', () => {
    it('generates a guide from prompt and context', async () => {
      mockComplete.mockResolvedValueOnce(makeResult(GUIDE_JSON))

      const result = await service.generateGuide('linear equations', 'algebra', collector)

      expect(result.guide).toEqual(JSON.parse(GUIDE_JSON))
      expect(result.model).toBe('llama3.1:8b')
    })

    it('records guide step in metrics', async () => {
      mockComplete.mockResolvedValueOnce(makeResult(GUIDE_JSON))

      await service.generateGuide('p', 'c', collector)

      expect(collector.build().steps[MetricsStep.Guide]).toBeDefined()
    })

    it('fails fast on invalid JSON', async () => {
      mockComplete.mockResolvedValueOnce(makeResult('not json'))

      await expect(service.generateGuide('p', 'c', collector)).rejects.toThrow(HttpException)
    })

    it('extracts JSON from markdown code fences', async () => {
      mockComplete.mockResolvedValueOnce(makeResult('```json\n' + GUIDE_JSON + '\n```'))

      const result = await service.generateGuide('p', 'c', collector)

      expect(result.guide).toEqual(JSON.parse(GUIDE_JSON))
    })
  })

  describe('generateStudents', () => {
    it('fans out and generates for each student', async () => {
      mockComplete
        .mockResolvedValueOnce(makeResult(QUIZ_JSON))
        .mockResolvedValueOnce(makeResult(QUIZ_JSON))

      const results = await service.generateStudents(
        {
          prompt: 'p',
          context: 'c',
          students: ['STU-001', 'STU-002'],
          questionCount: 1,
          systemPromptTemplate:
            'Generate for student {{STUDENT_INDEX}}, {{QUESTION_COUNT}} questions',
          schema: TestSchema,
        },
        JSON.parse(GUIDE_JSON),
        collector,
      )

      expect(results).toHaveLength(2)
      expect(results[0].identificationNumber).toBe('STU-001')
      expect(results[1].identificationNumber).toBe('STU-002')
    })

    it('records per-student steps in metrics', async () => {
      mockComplete.mockResolvedValueOnce(makeResult(QUIZ_JSON))

      await service.generateStudents(
        {
          prompt: 'p',
          context: 'c',
          students: ['STU-001'],
          questionCount: 1,
          systemPromptTemplate: 'template {{STUDENT_INDEX}} {{QUESTION_COUNT}}',
          schema: TestSchema,
        },
        JSON.parse(GUIDE_JSON),
        collector,
      )

      expect(collector.build().steps[studentStep(0)]).toBeDefined()
    })

    it('retries and succeeds when student content fails then passes', async () => {
      const invalidJson = JSON.stringify({ questions: [], chatContext: 'x' })
      mockComplete
        .mockResolvedValueOnce(makeResult(invalidJson))
        .mockResolvedValueOnce(makeResult(QUIZ_JSON))

      const results = await service.generateStudents(
        {
          prompt: 'p',
          context: 'c',
          students: ['STU-001'],
          questionCount: 1,
          systemPromptTemplate: 'template {{STUDENT_INDEX}} {{QUESTION_COUNT}}',
          schema: TestSchema,
        },
        JSON.parse(GUIDE_JSON),
        collector,
      )

      expect(results).toHaveLength(1)
      expect(mockComplete).toHaveBeenCalledTimes(2)
    })
  })

  describe('parseJson', () => {
    it('parses valid JSON', () => {
      const result = service.parseJson<{ a: number }>('{"a": 1}', 'test')
      expect(result).toEqual({ a: 1 })
    })

    it('throws HttpException for invalid JSON', () => {
      expect(() => service.parseJson('not json', 'test')).toThrow(HttpException)
    })

    it('extracts JSON from surrounding text', () => {
      const result = service.parseJson<{ a: number }>('Here is the result: {"a": 1} done', 'test')
      expect(result).toEqual({ a: 1 })
    })
  })
})

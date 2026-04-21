import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import type { TaskProcessResponse } from '@primer-guidy/nest-shared'
import { ContentPersistenceService } from './content-persistence.service'

const mockSet = vi.fn()
const mockCommit = vi.fn().mockResolvedValue(undefined)
const mockBatch = vi.fn().mockReturnValue({ set: mockSet, commit: mockCommit })

const mockStudentDoc = vi.fn().mockReturnValue({})
const mockStudentCollection = vi.fn().mockReturnValue({ doc: mockStudentDoc })

const mockContentDocRef = {
  id: 'auto-id-1',
  collection: mockStudentCollection,
}
const mockContentDoc = vi.fn().mockReturnValue(mockContentDocRef)
const mockContentCollection = vi.fn().mockReturnValue({ doc: mockContentDoc })

const mockFirestore = {
  collection: mockContentCollection,
  batch: mockBatch,
}

const makeResponse = (overrides?: Partial<TaskProcessResponse>): TaskProcessResponse => ({
  type: 'task-generator',
  task: 'quiz',
  valid: true,
  guide: { topic: 'algebra' },
  studentContents: [
    {
      identificationNumber: 'STU-001',
      questions: [{ id: 'q1', statement: 'What is x+1=2?' }],
      chatContext: 'algebra context',
      metrics: { durationMs: 100, promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    },
  ],
  model: 'gpt-4',
  metrics: { steps: {}, totalDurationMs: 500, totalTokens: 60 },
  ...overrides,
})

describe('ContentPersistenceService', () => {
  let service: ContentPersistenceService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ContentPersistenceService(mockFirestore as never)
  })

  it('saves content and student subcollections via batch', async () => {
    const response = makeResponse()

    service.save('teacher-1', 'ch-1', response)

    await vi.waitFor(() => {
      expect(mockCommit).toHaveBeenCalledOnce()
    })

    expect(mockContentCollection).toHaveBeenCalledWith('users/teacher-1/channels/ch-1/quizzes')
    expect(mockSet).toHaveBeenCalledTimes(2)
    expect(mockStudentDoc).toHaveBeenCalledWith('STU-001')
  })

  it('maps homework task to homework collection name', async () => {
    service.save('teacher-1', 'ch-1', makeResponse({ task: 'homework' }))

    await vi.waitFor(() => {
      expect(mockCommit).toHaveBeenCalledOnce()
    })

    expect(mockContentCollection).toHaveBeenCalledWith('users/teacher-1/channels/ch-1/homework')
  })

  it('handles multiple students', async () => {
    const response = makeResponse({
      studentContents: [
        {
          identificationNumber: 'STU-001',
          questions: [],
          chatContext: 'ctx1',
          metrics: { durationMs: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        },
        {
          identificationNumber: 'STU-002',
          questions: [],
          chatContext: 'ctx2',
          metrics: { durationMs: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        },
      ],
    })

    service.save('teacher-1', 'ch-1', response)

    await vi.waitFor(() => {
      expect(mockCommit).toHaveBeenCalledOnce()
    })

    expect(mockStudentDoc).toHaveBeenCalledWith('STU-001')
    expect(mockStudentDoc).toHaveBeenCalledWith('STU-002')
    const MAIN_DOC_SET = 1
    const STUDENT_SETS = 2
    expect(mockSet).toHaveBeenCalledTimes(MAIN_DOC_SET + STUDENT_SETS)
  })

  it('logs error when batch commit fails', async () => {
    mockCommit.mockRejectedValueOnce(new Error('Firestore down'))

    service.save('teacher-1', 'ch-1', makeResponse())

    await vi.waitFor(() => {
      expect(mockCommit).toHaveBeenCalledOnce()
    })
  })
})

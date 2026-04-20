import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import type { MetricsCollector } from '@primer-guidy/nest-shared'

const DEFAULT_BRAIN_BASE_URL = 'http://localhost:3011'

const BrainEndpoint = {
  Chat: '/api/chat',
  Quiz: '/api/task/quiz',
  Homework: '/api/task/homework',
} as const

export interface ChatBrainRequest {
  readonly prompt: string
  readonly context: string
  readonly history?: readonly { role: string; content: string }[]
}

export interface QuizBrainRequest {
  readonly prompt: string
  readonly context: string
  readonly studentCount: number
}

export interface HomeworkBrainRequest {
  readonly prompt: string
  readonly context: string
  readonly studentCount: number
  readonly questionCount?: number
  readonly openQuestion?: boolean
}

export interface BrainResponse {
  readonly [key: string]: unknown
}

@Injectable()
export class BrainClientService {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = process.env['BRAIN_BASE_URL'] ?? DEFAULT_BRAIN_BASE_URL
    this.apiKey = process.env['BRAIN_API_KEY'] ?? ''
  }

  async chat(request: ChatBrainRequest, collector: MetricsCollector): Promise<BrainResponse> {
    return this.callBrain(BrainEndpoint.Chat, request, collector)
  }

  async quiz(request: QuizBrainRequest, collector: MetricsCollector): Promise<BrainResponse> {
    return this.callBrain(BrainEndpoint.Quiz, request, collector)
  }

  async homework(
    request: HomeworkBrainRequest,
    collector: MetricsCollector,
  ): Promise<BrainResponse> {
    return this.callBrain(BrainEndpoint.Homework, request, collector)
  }

  private async callBrain(
    endpoint: string,
    body: ChatBrainRequest | QuizBrainRequest | HomeworkBrainRequest,
    collector: MetricsCollector,
  ): Promise<BrainResponse> {
    const start = performance.now()
    let response: Response

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(body),
      })
    } catch {
      throw new HttpException('Brain server is unavailable', HttpStatus.SERVICE_UNAVAILABLE)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error')
      throw new HttpException(`Brain server error: ${body}`, response.status)
    }

    const result = (await response.json()) as BrainResponse
    const durationMs = Math.round(performance.now() - start)

    const metrics = (result['metrics'] as Record<string, unknown>) ?? {}
    const steps = (metrics['steps'] as Record<string, Record<string, number>>) ?? {}

    for (const [name, step] of Object.entries(steps)) {
      collector.addStep(`brain.${name}`, {
        durationMs: step['durationMs'] ?? 0,
        promptTokens: step['promptTokens'] ?? 0,
        completionTokens: step['completionTokens'] ?? 0,
        totalTokens: step['totalTokens'] ?? 0,
      })
    }

    if (Object.keys(steps).length === 0) {
      collector.addStep('brain', {
        durationMs,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      })
    }

    return result
  }
}

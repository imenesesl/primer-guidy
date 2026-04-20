import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ChatRole } from '@primer-guidy/llm-services'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import type { MetricsCollector, StudentContentDto } from '@primer-guidy/nest-shared'
import { LLM_PROVIDER } from '../../../tokens'
import { TASK_GUIDE_PROMPT } from '../../../prompts'
import { MetricsStep, BrainError, TemplatePlaceholder, studentStep } from '../../../constants'
import type { ZodSchema } from 'zod'

const MAX_RETRIES = 2
const DEFAULT_CONCURRENCY = 2
const ENV_TASK_CONCURRENCY = 'TASK_CONCURRENCY'
const CONCURRENCY_LIMIT = Math.max(
  1,
  Number(process.env[ENV_TASK_CONCURRENCY]) || DEFAULT_CONCURRENCY,
)
const GUIDE_TEMPERATURE = 0.2
const STUDENT_TEMPERATURE = 0.7
const MAX_TOKENS = 8192
const TIMEOUT_MS = 90_000
const RETRY_DELAY_BASE_MS = 500
const JSON_INDENT = 2

export interface StudentGenerationConfig {
  readonly prompt: string
  readonly context: string
  readonly studentCount: number
  readonly questionCount: number
  readonly systemPromptTemplate: string
  readonly schema: ZodSchema
}

export interface GuideResult {
  readonly guide: Record<string, unknown>
  readonly model: string
}

@Injectable()
export class TaskGuideService {
  private readonly logger = new Logger(TaskGuideService.name)

  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {}

  async generateGuide(
    prompt: string,
    context: string,
    collector: MetricsCollector,
  ): Promise<GuideResult> {
    const messages: ChatMessage[] = [
      { role: ChatRole.System, content: TASK_GUIDE_PROMPT },
      {
        role: ChatRole.User,
        content: `Context: ${context}\n\nGenerate a learning guide for: ${prompt}`,
      },
    ]

    const result = await collector.record(MetricsStep.Guide, () =>
      this.llm.complete(messages, {
        temperature: GUIDE_TEMPERATURE,
        maxTokens: MAX_TOKENS,
        timeoutMs: TIMEOUT_MS,
        jsonMode: true,
      }),
    )

    const guide = this.parseJson<Record<string, unknown>>(result.content, MetricsStep.Guide)
    return { guide, model: result.model }
  }

  async generateStudents(
    config: StudentGenerationConfig,
    guide: Record<string, unknown>,
    collector: MetricsCollector,
  ): Promise<StudentContentDto[]> {
    const ac = new AbortController()
    try {
      return await this.fanOut(config, guide, ac.signal, collector)
    } catch (err) {
      ac.abort()
      throw err
    }
  }

  private async fanOut(
    config: StudentGenerationConfig,
    guide: Record<string, unknown>,
    signal: AbortSignal,
    collector: MetricsCollector,
  ): Promise<StudentContentDto[]> {
    const indices = Array.from({ length: config.studentCount }, (_, i) => i)
    const results: StudentContentDto[] = []

    for (let start = 0; start < indices.length; start += CONCURRENCY_LIMIT) {
      const batch = indices.slice(start, start + CONCURRENCY_LIMIT)
      const batchResults = await Promise.all(
        batch.map((i) => this.generateWithRetry(i, config, guide, signal, collector)),
      )
      results.push(...batchResults)
    }

    return results
  }

  private async generateWithRetry(
    index: number,
    config: StudentGenerationConfig,
    guide: Record<string, unknown>,
    signal: AbortSignal,
    collector: MetricsCollector,
  ): Promise<StudentContentDto> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.generateForStudent(index, config, guide, signal, collector)
      } catch (err) {
        lastError = err as Error
        if (signal.aborted) throw lastError

        this.logger.warn(
          `${studentStep(index)} attempt ${attempt + 1}/${MAX_RETRIES + 1} failed: ${lastError.message}`,
        )

        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_BASE_MS * (attempt + 1)))
        }
      }
    }

    throw lastError as Error
  }

  private async generateForStudent(
    index: number,
    config: StudentGenerationConfig,
    guide: Record<string, unknown>,
    signal: AbortSignal,
    collector: MetricsCollector,
  ): Promise<StudentContentDto> {
    const systemPrompt = config.systemPromptTemplate
      .replace(TemplatePlaceholder.StudentIndex, String(index))
      .replace(TemplatePlaceholder.QuestionCount, String(config.questionCount))

    const messages: ChatMessage[] = [
      { role: ChatRole.System, content: systemPrompt },
      {
        role: ChatRole.User,
        content: `Learning guide:\n${JSON.stringify(guide, null, JSON_INDENT)}\n\nContext: ${config.context}\nPrompt: ${config.prompt}`,
      },
    ]

    const result = await collector.record(studentStep(index), () =>
      this.llm.complete(messages, {
        temperature: STUDENT_TEMPERATURE,
        maxTokens: MAX_TOKENS,
        timeoutMs: TIMEOUT_MS,
        signal,
        jsonMode: true,
      }),
    )

    const parsed = this.parseAndValidate(result.content, config.schema, studentStep(index))
    const trimmedQuestions = parsed.questions.slice(0, config.questionCount)

    return {
      studentIndex: index,
      questions: trimmedQuestions,
      chatContext: parsed.chatContext,
      metrics: {
        durationMs: result.durationMs,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    }
  }

  parseJson<T>(raw: string, step: string): T {
    const cleaned = this.extractJson(raw)
    try {
      return JSON.parse(cleaned) as T
    } catch {
      this.logger.error(
        `Failed to parse JSON at step "${step}". Raw:\n${raw}\nExtracted:\n${cleaned}`,
      )
      throw new HttpException(`${BrainError.JsonParseFailed} "${step}"`, HttpStatus.BAD_GATEWAY)
    }
  }

  private extractJson(raw: string): string {
    const fenced = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (fenced?.[1]) return fenced[1].trim()

    const braceStart = raw.indexOf('{')
    const braceEnd = raw.lastIndexOf('}')
    if (braceStart !== -1 && braceEnd > braceStart) {
      return raw.slice(braceStart, braceEnd + 1)
    }

    return raw.trim()
  }

  private parseAndValidate(
    raw: string,
    schema: ZodSchema,
    step: string,
  ): { questions: never[]; chatContext: string } {
    const parsed = this.parseJson(raw, step)
    const result = schema.safeParse(parsed)

    if (!result.success) {
      throw new HttpException(
        `${BrainError.SchemaValidationFailed} "${step}": ${result.error.message}`,
        HttpStatus.BAD_GATEWAY,
      )
    }

    return result.data as { questions: never[]; chatContext: string }
  }
}

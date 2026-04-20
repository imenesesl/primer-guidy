import { Injectable, Inject } from '@nestjs/common'
import { ChatRole } from '@primer-guidy/llm-services'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import type { MetricsCollector } from '@primer-guidy/nest-shared'
import { LLM_PROVIDER } from '../../tokens'
import { CHAT_GUIDE_PROMPT } from '../../prompts'
import { MetricsStep } from '../../constants'

const CHAT_TEMPERATURE = 0.4
const CHAT_MAX_TOKENS = 512

export interface ChatRequest {
  readonly prompt: string
  readonly context: string
  readonly history?: readonly { role: string; content: string }[]
}

export interface ChatResponse {
  readonly reply: string
  readonly model: string
}

@Injectable()
export class ChatService {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {}

  async generate(request: ChatRequest, collector: MetricsCollector): Promise<ChatResponse> {
    const messages: ChatMessage[] = [
      { role: ChatRole.System, content: `${CHAT_GUIDE_PROMPT}\n\nContext: ${request.context}` },
    ]

    if (request.history) {
      for (const turn of request.history) {
        const role = turn.role === ChatRole.Assistant ? ChatRole.Assistant : ChatRole.User
        messages.push({ role, content: turn.content })
      }
    }

    messages.push({ role: ChatRole.User, content: request.prompt })

    const result = await collector.record(MetricsStep.Chat, () =>
      this.llm.complete(messages, { temperature: CHAT_TEMPERATURE, maxTokens: CHAT_MAX_TOKENS }),
    )

    return {
      reply: result.content,
      model: result.model,
    }
  }
}

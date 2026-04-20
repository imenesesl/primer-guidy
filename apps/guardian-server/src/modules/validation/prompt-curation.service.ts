import { Injectable, Inject } from '@nestjs/common'
import { ChatRole } from '@primer-guidy/llm-services'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import type { MetricsCollector, ProcessType } from '@primer-guidy/nest-shared'
import { LLM_CURATION } from '../../tokens'
import { CURATION_CHAT_PROMPT, CURATION_TASK_PROMPT } from '../../prompts'

const CURATION_TEMPERATURE = 0.2
const CURATION_MAX_TOKENS = 256

@Injectable()
export class PromptCurationService {
  constructor(@Inject(LLM_CURATION) private readonly llm: ILlmProvider) {}

  async curate(
    prompt: string,
    context: string,
    type: ProcessType,
    collector: MetricsCollector,
  ): Promise<string> {
    const systemPrompt = type === 'chat' ? CURATION_CHAT_PROMPT : CURATION_TASK_PROMPT

    const messages: ChatMessage[] = [
      { role: ChatRole.System, content: systemPrompt },
      {
        role: ChatRole.User,
        content: `Context: ${context}\n\nOriginal prompt: ${prompt}`,
      },
    ]

    const result = await collector.record('curation', () =>
      this.llm.complete(messages, {
        temperature: CURATION_TEMPERATURE,
        maxTokens: CURATION_MAX_TOKENS,
      }),
    )
    return result.content.trim()
  }
}

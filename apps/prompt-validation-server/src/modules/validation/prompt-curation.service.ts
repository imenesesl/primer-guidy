import { Injectable, Inject } from '@nestjs/common'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import { LLM_CURATION } from '../../tokens'
import { CURATION_SYSTEM_PROMPT } from '../../prompts'

@Injectable()
export class PromptCurationService {
  constructor(@Inject(LLM_CURATION) private readonly llm: ILlmProvider) {}

  async curate(prompt: string, context: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: CURATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Context: ${context}\n\nOriginal prompt: ${prompt}`,
      },
    ]

    const result = await this.llm.complete(messages, { temperature: 0.3 })
    return result.content.trim()
  }
}

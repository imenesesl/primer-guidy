import { Injectable, Inject } from '@nestjs/common'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import { LLM_PROVIDER } from '../../tokens'
import { GENERATION_SYSTEM_PROMPT } from '../../prompts'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'

@Injectable()
export class GenerationService {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {}

  async generate(prompt: string, context: string): Promise<GenerationResponseDto> {
    const messages: ChatMessage[] = [
      { role: 'system', content: GENERATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Context: ${context}\n\nGenerate content for: ${prompt}`,
      },
    ]

    const result = await this.llm.complete(messages, { temperature: 0.7 })

    return {
      content: result.content,
      model: result.model,
      tokensUsed: result.tokensUsed,
    }
  }
}

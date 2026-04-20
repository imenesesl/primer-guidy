import { Injectable, Inject } from '@nestjs/common'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import { LLM_CURATION } from '../../tokens'

const CURATION_SYSTEM_PROMPT = `You are a prompt optimizer. You receive a user prompt that has already been validated as safe and contextually appropriate.

Your job is to rewrite the prompt to be:
1. Clearer and more precise
2. Well-structured for an LLM to process
3. Faithful to the user's original intent — do NOT change the meaning
4. Grounded in the provided context

Respond with ONLY the optimized prompt text. No explanations, no metadata, no markdown wrappers.`

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

import { Injectable, Inject } from '@nestjs/common'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import { LLM_PROVIDER } from '../../tokens'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'

const GENERATION_SYSTEM_PROMPT = `You are an expert educational content generator. You receive a curated, validated prompt and a context scope.

Rules:
1. Generate content ONLY within the provided context. Never deviate from the topic.
2. Produce clear, well-structured, and pedagogically sound content.
3. Use appropriate formatting (headings, lists, examples) when helpful.
4. Keep language accessible and engaging for learners.
5. If the prompt asks for something outside the context, respond with a brief note explaining you can only generate content within the given context.`

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

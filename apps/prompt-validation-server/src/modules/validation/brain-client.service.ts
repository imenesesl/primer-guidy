import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'

@Injectable()
export class BrainClientService {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    this.baseUrl = process.env['BRAIN_BASE_URL'] ?? 'http://localhost:3011'
    this.apiKey = process.env['BRAIN_API_KEY'] ?? ''
  }

  async generate(curatedPrompt: string, context: string): Promise<GenerationResponseDto> {
    let response: Response

    try {
      response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ prompt: curatedPrompt, context }),
      })
    } catch {
      throw new HttpException('Brain server is unavailable', HttpStatus.SERVICE_UNAVAILABLE)
    }

    if (!response.ok) {
      const body = await response.text().catch(() => 'Unknown error')
      throw new HttpException(`Brain server error: ${body}`, response.status)
    }

    return (await response.json()) as GenerationResponseDto
  }
}

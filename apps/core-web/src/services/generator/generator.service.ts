import type { TaskGeneratorResponse, GenerateContentArgs } from './generator.types'

const GUARDIAN_BASE_URL = import.meta.env.GUARDIAN_BASE_URL ?? 'http://localhost:3010'
const API_KEY = import.meta.env.VALIDATION_API_KEY ?? ''
const DEFAULT_LANGUAGE = 'es'

const buildEndpoint = (channelId?: string, language?: string): string => {
  const url = new URL(`${GUARDIAN_BASE_URL}/api/process`)
  if (channelId) url.searchParams.set('channelId', channelId)
  url.searchParams.set('language', language ?? DEFAULT_LANGUAGE)
  return url.toString()
}

export const generateContent = async ({
  request,
  authToken,
  channelId,
  language,
}: GenerateContentArgs): Promise<TaskGeneratorResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(buildEndpoint(channelId, language), {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Guardian API error (${response.status}): ${text}`)
  }

  return response.json() as Promise<TaskGeneratorResponse>
}

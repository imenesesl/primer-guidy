import type { TaskGeneratorRequest, TaskGeneratorResponse } from './generator.types'

const GUARDIAN_BASE_URL = import.meta.env.GUARDIAN_BASE_URL ?? 'http://localhost:3010'
const PROCESS_ENDPOINT = `${GUARDIAN_BASE_URL}/api/process`
const API_KEY = import.meta.env.VALIDATION_API_KEY ?? ''

export const generateContent = async (
  request: TaskGeneratorRequest,
): Promise<TaskGeneratorResponse> => {
  const response = await fetch(PROCESS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Guardian API error (${response.status}): ${text}`)
  }

  return response.json() as Promise<TaskGeneratorResponse>
}

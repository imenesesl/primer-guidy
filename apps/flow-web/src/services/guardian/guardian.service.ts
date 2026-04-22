import type { SendChatArgs, ChatResponse } from './guardian.types'

const GUARDIAN_BASE_URL = import.meta.env.GUARDIAN_BASE_URL ?? 'http://localhost:3010'
const API_KEY = import.meta.env.VALIDATION_API_KEY ?? ''

const PROCESS_ENDPOINT = `${GUARDIAN_BASE_URL}/api/process`

export const sendChat = async ({
  prompt,
  context,
  history,
  authToken,
}: SendChatArgs): Promise<ChatResponse> => {
  const response = await fetch(PROCESS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ type: 'chat', prompt, context, history }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Guardian API error (${response.status}): ${text}`)
  }

  return response.json() as Promise<ChatResponse>
}

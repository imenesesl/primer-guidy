import { AUTH_EMULATOR_URL, FIREBASE_PROJECT_ID, FIREBASE_API_KEY } from './emulator.constants'

interface OobCode {
  readonly email: string
  readonly requestType: string
  readonly oobCode: string
  readonly oobLink: string
}

interface OobCodesResponse {
  readonly oobCodes: readonly OobCode[]
}

export const getOobCodeForEmail = async (email: string): Promise<OobCode> => {
  const url = `${AUTH_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/oobCodes`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch OOB codes: ${response.statusText}`)
  }

  const data = (await response.json()) as OobCodesResponse
  const code = data.oobCodes
    .filter((c) => c.email === email && c.requestType === 'EMAIL_SIGNIN')
    .at(-1)

  if (!code) {
    throw new Error(`No OOB code found for email: ${email}`)
  }

  return code
}

export const buildEmailLinkUrl = (appPath: string, oobCode: string): string =>
  `${appPath}${appPath.includes('?') ? '&' : '?'}mode=signIn&oobCode=${oobCode}&apiKey=${FIREBASE_API_KEY}&lang=en`

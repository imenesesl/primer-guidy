const HEX_RADIX = 16
const BYTE_PAD_LENGTH = 2

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(HEX_RADIX).padStart(BYTE_PAD_LENGTH, '0')).join('')
}

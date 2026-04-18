const CODE_MAX = 10_000_000_000
const CODE_LENGTH = 10
const DJB2_INITIAL = 5381
const DJB2_SHIFT = 5

export const generateCodeFromUid = (uid: string, attempt = 0): string => {
  const input = attempt === 0 ? uid : `${uid}:${attempt}`
  let hash = DJB2_INITIAL

  for (let i = 0; i < input.length; i++) {
    hash = ((hash << DJB2_SHIFT) + hash + input.charCodeAt(i)) | 0
  }

  const numeric = Math.abs(hash) % CODE_MAX
  return numeric.toString().padStart(CODE_LENGTH, '0')
}

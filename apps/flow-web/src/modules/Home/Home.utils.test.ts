import { describe, it, expect } from 'vitest'
import { getLearningUrl } from './Home.utils'

describe('getLearningUrl', () => {
  it('concatenates origin, basePath, and learning', () => {
    expect(getLearningUrl('https://example.com', '/app/')).toBe('https://example.com/app/learning')
  })

  it('works with trailing slash in basePath', () => {
    expect(getLearningUrl('https://example.com', '/base/')).toBe(
      'https://example.com/base/learning',
    )
  })

  it('works with empty basePath', () => {
    expect(getLearningUrl('https://example.com', '')).toBe('https://example.comlearning')
  })
})

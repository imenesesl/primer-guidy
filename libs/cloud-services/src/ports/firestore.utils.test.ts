import { describe, it, expect } from 'vitest'
import { buildSubcollectionPath } from './firestore.utils'

describe('buildSubcollectionPath', () => {
  it('builds a subcollection path from parent, id, and subcollection', () => {
    const result = buildSubcollectionPath('users', 'uid-123', 'students')
    expect(result).toBe('users/uid-123/students')
  })

  it('handles different collection names', () => {
    const result = buildSubcollectionPath('organizations', 'org-1', 'members')
    expect(result).toBe('organizations/org-1/members')
  })
})

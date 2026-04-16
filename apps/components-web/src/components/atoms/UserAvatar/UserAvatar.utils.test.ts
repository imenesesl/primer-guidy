import { getInitials } from './UserAvatar.utils'

describe('getInitials', () => {
  it('returns two initials for a full name', () => {
    expect(getInitials('Jane Doe')).toBe('JD')
  })

  it('returns a single initial for a single name', () => {
    expect(getInitials('Jane')).toBe('J')
  })

  it('returns empty string for an empty string', () => {
    expect(getInitials('')).toBe('')
  })

  it('uppercases lowercase initials', () => {
    expect(getInitials('jane doe')).toBe('JD')
  })

  it('takes only the first two name parts', () => {
    expect(getInitials('Jane Mary Doe')).toBe('JM')
  })

  it('handles extra whitespace between names', () => {
    expect(getInitials('  Jane   Doe  ')).toBe('JD')
  })

  it('handles a name with only whitespace', () => {
    expect(getInitials('   ')).toBe('')
  })
})

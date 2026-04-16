import { describe, it, expect } from 'vitest'
import { FirebaseHostingAdapter } from './hosting.adapter'

describe('FirebaseHostingAdapter', () => {
  it('returns project URL using projectId', () => {
    const adapter = new FirebaseHostingAdapter({ projectId: 'my-project' })

    expect(adapter.getProjectUrl()).toBe('https://my-project.web.app')
  })

  it('returns project URL using custom site', () => {
    const adapter = new FirebaseHostingAdapter({
      projectId: 'my-project',
      site: 'custom-site',
    })

    expect(adapter.getProjectUrl()).toBe('https://custom-site.web.app')
  })

  it('returns preview URL with channel id', () => {
    const adapter = new FirebaseHostingAdapter({ projectId: 'my-project' })

    expect(adapter.getPreviewUrl('pr-42')).toBe('https://my-project--pr-42.web.app')
  })

  it('returns preview URL with custom site and channel id', () => {
    const adapter = new FirebaseHostingAdapter({
      projectId: 'my-project',
      site: 'custom-site',
    })

    expect(adapter.getPreviewUrl('pr-42')).toBe('https://custom-site--pr-42.web.app')
  })
})

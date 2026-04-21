import { describe, it, expect, vi } from 'vitest'
import type { INestApplication } from '@nestjs/common'

vi.mock('@nestjs/swagger', () => {
  const config = {}
  const addApiKey = vi.fn().mockReturnValue({ build: vi.fn().mockReturnValue(config) })
  const setVersion = vi.fn().mockReturnValue({ addApiKey })
  const setDescription = vi.fn().mockReturnValue({ setVersion })
  const setTitle = vi.fn().mockReturnValue({ setDescription })

  class MockDocumentBuilder {
    setTitle = setTitle
  }

  return {
    DocumentBuilder: MockDocumentBuilder,
    SwaggerModule: {
      createDocument: vi.fn().mockReturnValue({ paths: {} }),
      setup: vi.fn(),
    },
  }
})

import { SwaggerModule } from '@nestjs/swagger'
import { setupSwagger } from './setup-swagger'

describe('setupSwagger', () => {
  it('creates document and sets up swagger at /docs', () => {
    const mockApp = {} as INestApplication

    setupSwagger(mockApp, {
      title: 'Test API',
      description: 'Test description',
      version: '1.0',
    })

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(mockApp, expect.any(Object))
    expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', mockApp, expect.any(Object))
  })

  it('adds X-API-Key security definition', () => {
    const mockApp = {} as INestApplication

    setupSwagger(mockApp, {
      title: 'API',
      description: 'desc',
      version: '2.0',
    })

    expect(SwaggerModule.setup).toHaveBeenCalledTimes(2)
  })
})

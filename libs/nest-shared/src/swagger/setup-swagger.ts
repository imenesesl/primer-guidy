import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export interface SwaggerConfig {
  readonly title: string
  readonly description: string
  readonly version: string
}

export const setupSwagger = (app: INestApplication, config: SwaggerConfig): void => {
  const builder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .build()

  const document = SwaggerModule.createDocument(app, builder)
  SwaggerModule.setup('docs', app, document)
}

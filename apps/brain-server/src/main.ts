import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { loadMonorepoEnv, setupSwagger } from '@primer-guidy/nest-shared'
import { AppModule } from './app.module'
import { DomainExceptionFilter } from './filters/domain-exception.filter'

const DEFAULT_PORT = 3011

loadMonorepoEnv(__dirname)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new DomainExceptionFilter())

  setupSwagger(app, {
    title: 'Brain API',
    description:
      'Server-to-server content generation API. Requires X-API-Key header for authentication.',
    version: '1.0',
  })

  const port = process.env['PORT'] ?? DEFAULT_PORT
  await app.listen(port)
}

void bootstrap()

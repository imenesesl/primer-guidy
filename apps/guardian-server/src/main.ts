import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { loadMonorepoEnv, setupSwagger } from '@primer-guidy/nest-shared'
import { AppModule } from './app.module'
import { DomainExceptionFilter } from './filters/domain-exception.filter'

const DEFAULT_PORT = 3010

loadMonorepoEnv(__dirname)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new DomainExceptionFilter())
  app.enableCors()

  setupSwagger(app, {
    title: 'Prompt Processing API',
    description:
      'Validates user prompts for safety, curates them, and forwards to Brain for content generation. Supports chat and task-generator modes with per-step metrics.',
    version: '2.0',
  })

  const port = process.env['PORT'] ?? DEFAULT_PORT
  await app.listen(port)
}

void bootstrap()

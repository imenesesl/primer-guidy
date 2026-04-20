import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { loadMonorepoEnv, setupSwagger } from '@primer-guidy/nest-shared'
import { AppModule } from './app.module'

const DEFAULT_PORT = 3010

loadMonorepoEnv(__dirname)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors()

  setupSwagger(app, {
    title: 'Prompt Validation API',
    description:
      'Validates user prompts for safety (Llama Guard 3), curates them (Llama 3.1), and forwards to Brain for content generation.',
    version: '1.0',
  })

  const port = process.env['PORT'] ?? DEFAULT_PORT
  await app.listen(port)
}

void bootstrap()

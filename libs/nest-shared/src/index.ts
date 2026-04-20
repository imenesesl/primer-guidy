export { HealthModule } from './health/health.module'
export { LlmModule } from './llm/llm.module'
export type { LlmRegistration } from './llm/llm.module'
export { MetricsCollector } from './llm/metrics-collector'
export { ApiKeyGuard } from './guards/api-key.guard'
export { ValidationApiKeyGuard } from './guards/validation-api-key.guard'
export { SanitizeInputPipe } from './pipes/sanitize-input.pipe'
export { PromptContextDto } from './dto/prompt-context.dto'
export type { GenerationResponseDto } from './dto/generation-response.dto'
export { ChatTurnDto } from './dto/chat-turn.dto'
export {
  ChatRequestDto,
  TaskGeneratorRequestDto,
  PROCESS_TYPES,
  TASK_KINDS,
} from './dto/process-request.dto'
export type { ProcessType, TaskKind } from './dto/process-request.dto'
export type { StepMetrics, PipelineMetrics } from './dto/step-metrics.dto'
export type {
  ProcessResponse,
  ChatProcessResponse,
  TaskProcessResponse,
  ValidationFailResponse,
  QuestionDto,
  StudentContentDto,
} from './dto/process-response.dto'
export { setupSwagger } from './swagger/setup-swagger'
export type { SwaggerConfig } from './swagger/setup-swagger'
export { loadMonorepoEnv } from './env/load-env'

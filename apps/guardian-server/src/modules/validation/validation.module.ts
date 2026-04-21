import { Module } from '@nestjs/common'
import { ValidationController } from './validation.controller'
import { ValidationService } from './validation.service'
import { SafetyGuardService } from './safety-guard.service'
import { PromptCurationService } from './prompt-curation.service'
import { BrainClientService } from './brain-client.service'
import { PersistenceModule } from '../persistence/persistence.module'

@Module({
  imports: [PersistenceModule],
  controllers: [ValidationController],
  providers: [ValidationService, SafetyGuardService, PromptCurationService, BrainClientService],
})
export class ValidationModule {}

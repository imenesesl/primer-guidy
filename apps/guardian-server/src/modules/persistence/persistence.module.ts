import { Module } from '@nestjs/common'
import { ContentPersistenceService } from './content-persistence.service'

@Module({
  providers: [ContentPersistenceService],
  exports: [ContentPersistenceService],
})
export class PersistenceModule {}

import { Module } from '@nestjs/common'
import { TaskGuideService } from './task-guide.service'

@Module({
  providers: [TaskGuideService],
  exports: [TaskGuideService],
})
export class SharedTaskModule {}

import { Module } from '@nestjs/common'
import { SharedTaskModule } from '../shared/shared-task.module'
import { HomeworkController } from './homework.controller'
import { HomeworkService } from './homework.service'

@Module({
  imports: [SharedTaskModule],
  controllers: [HomeworkController],
  providers: [HomeworkService],
})
export class HomeworkModule {}

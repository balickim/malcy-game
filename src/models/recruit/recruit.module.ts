import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { QueuesManagerService } from '~/models/queues-manager/queues-manager.service';
import { RecruitController } from '~/models/recruit/recruit.controller';
import { RecruitService } from '~/models/recruit/recruit.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity])],
  controllers: [RecruitController],
  providers: [RecruitService, QueuesManagerService],
})
export class RecruitModule {}

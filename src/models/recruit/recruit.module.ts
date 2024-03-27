import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecruitJobConsumer } from '~/jobs/consumers/recruit.job.consumer';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { RecruitController } from '~/models/recruit/recruit.controller';
import { RecruitService } from '~/models/recruit/recruit.service';
import { QueueRedisProviderModule } from '~/providers/queue/redis/provider.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity]), QueueRedisProviderModule],
  controllers: [RecruitController],
  providers: [RecruitService, RecruitJobConsumer],
})
export class RecruitModule {}

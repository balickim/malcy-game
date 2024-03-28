import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { RecruitController } from '~/models/recruit/recruit.controller';
import { RecruitService } from '~/models/recruit/recruit.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity])],
  controllers: [RecruitController],
  providers: [RecruitService],
})
export class RecruitModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmiesService } from '~/modules/armies/armies.service';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity])],
  providers: [ArmiesService],
  exports: [ArmiesService],
})
export class ArmiesModule {}

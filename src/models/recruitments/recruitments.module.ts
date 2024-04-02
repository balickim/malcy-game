import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { QueuesManagerService } from '~/models/queues-manager/queues-manager.service';
import { RecruitmentsController } from '~/models/recruitments/recruitments.controller';
import { RecruitmentsService } from '~/models/recruitments/recruitments.service';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsService } from '~/models/settlements/settlements.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyEntity, SettlementsEntity])],
  controllers: [RecruitmentsController],
  providers: [RecruitmentsService, QueuesManagerService, SettlementsService],
})
export class RecruitmentsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsSubscriber } from '~/models/settlements/settlements.subscriber';

import { Settlements } from './settlements';
import { SettlementsController } from './settlements.controller';
import { SettlementsGateway } from './settlements.gateway';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementsEntity, ArmyEntity])],
  controllers: [SettlementsController],
  providers: [
    SettlementsService,
    SettlementsGateway,
    Settlements,
    SettlementsSubscriber,
  ],
})
export class SettlementsModule {}

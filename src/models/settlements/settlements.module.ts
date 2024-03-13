import { Module } from '@nestjs/common';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';
import { SettlementsGateway } from './settlements.gateway';
import { Settlements } from './settlements';
import { SettlementsSubscriber } from '~/models/settlements/settlements.subscriber';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementsEntity])],
  controllers: [SettlementsController],
  providers: [
    SettlementsService,
    SettlementsGateway,
    Settlements,
    SettlementsSubscriber,
  ],
})
export class SettlementsModule {}

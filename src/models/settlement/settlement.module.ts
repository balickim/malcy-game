import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { SettlementGateway } from './settlement.gateway';
import { Settlement } from './settlement';
import { SettlementSubscriber } from '~/models/settlement/settlement.subscriber';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementEntity } from '~/models/settlement/entities/settlement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementEntity])],
  controllers: [SettlementController],
  providers: [
    SettlementService,
    SettlementGateway,
    Settlement,
    SettlementSubscriber,
  ],
})
export class SettlementModule {}

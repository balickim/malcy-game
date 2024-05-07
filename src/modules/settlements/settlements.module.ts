import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsSubscriber } from '~/modules/settlements/settlements.subscriber';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';

import { Settlements } from './settlements';
import { SettlementsController } from './settlements.controller';
import { SettlementsGateway } from './settlements.gateway';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettlementsEntity, ArmyEntity]),
    EventLogModule,
    ConfigModule,
    UsersModule,
  ],
  controllers: [SettlementsController],
  providers: [
    SettlementsService,
    SettlementsGateway,
    Settlements,
    SettlementsSubscriber,
    UserLocationService,
  ],
})
export class SettlementsModule {}

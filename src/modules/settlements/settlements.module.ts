import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsSubscriber } from '~/modules/settlements/settlements.subscriber';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';

import { SettlementsController } from './settlements.controller';
import { SettlementsGateway } from './settlements.gateway';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettlementsEntity, ArmyEntity]),
    EventLogModule,
    ConfigModule,
    UsersModule,
    FogOfWarModule,
    ArmiesModule,
  ],
  controllers: [SettlementsController],
  providers: [
    SettlementsService,
    SettlementsGateway,
    SettlementsSubscriber,
    UserLocationService,
  ],
  exports: [SettlementsService],
})
export class SettlementsModule {}

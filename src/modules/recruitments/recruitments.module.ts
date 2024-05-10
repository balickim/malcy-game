import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { RecruitmentsController } from '~/modules/recruitments/recruitments.controller';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArmyEntity, SettlementsEntity, EventLogEntity]),
    ConfigModule,
    UsersModule,
    FogOfWarModule,
  ],
  controllers: [RecruitmentsController],
  providers: [
    RecruitmentsService,
    SettlementsService,
    UserLocationService,
    EventLogService,
  ],
})
export class RecruitmentsModule {}

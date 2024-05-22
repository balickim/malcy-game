import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmiesModule } from '~/modules/armies/armies.module';
import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { CombatsController } from '~/modules/combats/combats.controller';
import { CombatsService } from '~/modules/combats/combats.service';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Module({
  controllers: [CombatsController],
  imports: [
    TypeOrmModule.forFeature([
      ArmyEntity,
      SettlementsEntity,
      EventLogEntity,
      UsersEntity,
      DiscoveredAreaEntity,
      VisibleAreaEntity,
      DiscoveredSettlementsEntity,
    ]),
    ConfigModule,
    SettlementsModule,
    UserLocationModule,
    ArmiesModule,
    SettlementsModule,
  ],
  providers: [CombatsService],
  exports: [CombatsService],
})
export class CombatsModule {}

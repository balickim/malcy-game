import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { FogOfWarModule } from '~/modules/fog-of-war/fog-of-war.module';
import { UserLocationGateway } from '~/modules/user-location/user-location.gateway';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersModule } from '~/modules/users/users.module';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  imports: [
    CacheRedisProviderModule,
    TypeOrmModule.forFeature([EventLogEntity]),
    ConfigModule,
    UsersModule,
    FogOfWarModule,
  ],
  providers: [UserLocationService, UserLocationGateway, EventLogService],
})
export class UserLocationModule {}

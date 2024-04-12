import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { UserLocationGateway } from '~/modules/user-location/user-location.gateway';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  imports: [
    CacheRedisProviderModule,
    TypeOrmModule.forFeature([EventLogEntity]),
  ],
  providers: [UserLocationService, UserLocationGateway, EventLogService],
})
export class UserLocationModule {}

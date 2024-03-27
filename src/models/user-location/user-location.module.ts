import { Module } from '@nestjs/common';

import { UserLocationGateway } from '~/models/user-location/user-location.gateway';
import { UserLocationService } from '~/models/user-location/user-location.service';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  imports: [CacheRedisProviderModule],
  providers: [UserLocationService, UserLocationGateway],
})
export class UserLocationModule {}

import { Module } from '@nestjs/common';

import { UserLocationGateway } from '~/models/user-location/user-location.gateway';
import { UserLocationService } from '~/models/user-location/user-location.service';
import { RedisProviderModule } from '~/providers/database/redis/provider.module';

@Module({
  imports: [RedisProviderModule],
  providers: [UserLocationService, UserLocationGateway],
})
export class UserLocationModule {}

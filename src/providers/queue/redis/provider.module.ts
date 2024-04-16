import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          redis: configService.appConfig.REDIS_CONNECTION_STRING,
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueRedisProviderModule {}

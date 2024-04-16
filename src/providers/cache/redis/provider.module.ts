import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';

import { ConfigModule } from '~/modules/config/config.module';
import { ConfigService } from '~/modules/config/config.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            url: configService.appConfig.REDIS_CONNECTION_STRING,
          },
        };
      },
    }),
  ],
})
export class CacheRedisProviderModule {}

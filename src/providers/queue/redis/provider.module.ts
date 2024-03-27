import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          redis: configService.get<string>('REDIS_CONNECTION_STRING'),
        };
      },
    }),
    BullModule.registerQueue({
      name: 'recruitQueue',
    }),
  ],
  exports: [BullModule],
})
export class QueueRedisProviderModule {}

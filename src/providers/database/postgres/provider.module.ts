import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogModule } from '~/modules/event-log/event-log.module';
import { EventLogSubscriber } from '~/modules/event-log/event-log.subscriber';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';
import { UsersEntity } from '~/modules/users/entities/users.entity';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        SettlementsModule,
        UsersModule,
        UserLocationModule,
        EventLogModule,
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DATABASE.HOST'),
          port: configService.get('DATABASE.PORT'),
          username: configService.get('DATABASE.USERNAME'),
          password: configService.get('DATABASE.PASSWORD'),
          database: configService.get('DATABASE.DATABASE'),
          migrations: [],
          migrationsTableName: 'typeorm_migrations',
          synchronize: configService.get('DATABASE.SYNCHRONIZE'),
          entities: [
            UsersEntity,
            SettlementsEntity,
            ArmyEntity,
            EventLogEntity,
          ],
          subscribers: [EventLogSubscriber],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}

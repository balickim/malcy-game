import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/models/settlements/settlements.module';
import { UserLocationModule } from '~/models/user-location/user-location.module';
import { UsersEntity } from '~/models/users/entities/users.entity';
import { UsersModule } from '~/models/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        SettlementsModule,
        UsersModule,
        UserLocationModule,
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
          entities: [UsersEntity, SettlementsEntity, ArmyEntity],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}

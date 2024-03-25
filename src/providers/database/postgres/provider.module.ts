import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { SettlementsModule } from '~/models/settlements/settlements.module';
import { UserLocationModule } from '~/models/user-location/user-location.module';
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
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class PostgresDatabaseProviderModule {}

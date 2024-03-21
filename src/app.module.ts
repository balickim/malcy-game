import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import { checkPostGISExtension } from '~/common/utils/postgis';
import config from '~/config/configuration';
import { ArmiesModule } from '~/models/armies/armies.module';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { AuthModule } from '~/models/auth/auth.module';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/models/settlements/settlements.module';
import { UsersEntity } from '~/models/users/entities/users.entity';
import { UsersModule } from '~/models/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SettlementsModule, UsersModule],
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
    }),
    UsersModule,
    SettlementsModule,
    AuthModule,
    ArmiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const hasPostGIS = await checkPostGISExtension(this.dataSource);
    if (!hasPostGIS) {
      console.warn('PostGIS extension is not available in the database.');
    } else {
      console.log('PostGIS extension is available.');
    }
  }
}

import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from '~/app.service';
import { AppController } from '~/app.controller';
import { UsersEntity } from '~/models/users/entities/users.entity';
import { UsersModule } from '~/models/users/users.module';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsModule } from '~/models/settlements/settlements.module';
import { checkPostGISExtension } from '~/common/utils/postgis';
import { AuthModule } from '~/models/auth/auth.module';
import config from '~/config/configuration';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { ArmiesModule } from '~/models/armies/armies.module';

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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_DATABASE', 'test'),
        migrations: [],
        migrationsTableName: 'typeorm_migrations',
        synchronize: configService.get('DB_SYNCHRONIZE', false),
        entities: [UsersEntity, SettlementsEntity, ArmyEntity],
      }),
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

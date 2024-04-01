import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import config from '~/common/config/configuration';
import { checkPostGISExtension } from '~/common/utils/postgis';
import { ArmiesModule } from '~/models/armies/armies.module';
import { AuthModule } from '~/models/auth/auth.module';
import { RecruitModule } from '~/models/recruit/recruit.module';
import { ResourcesModule } from '~/models/resources/resources.module';
import { SettlementsModule } from '~/models/settlements/settlements.module';
import { UserLocationModule } from '~/models/user-location/user-location.module';
import { UsersModule } from '~/models/users/users.module';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';
import { PostgresDatabaseProviderModule } from '~/providers/database/postgres/provider.module';
import { QueueRedisProviderModule } from '~/providers/queue/redis/provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    PostgresDatabaseProviderModule,
    CacheRedisProviderModule,
    QueueRedisProviderModule,
    UsersModule,
    SettlementsModule,
    AuthModule,
    ArmiesModule,
    UserLocationModule,
    RecruitModule,
    ResourcesModule,
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

import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import config from '~/common/config/configuration';
import { checkPostGISExtension } from '~/common/utils/postgis';
import { ArmiesModule } from '~/modules/armies/armies.module';
import { AuditLogModule } from '~/modules/audit-log/audit-log.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { RecruitmentsModule } from '~/modules/recruitments/recruitments.module';
import { ResourcesModule } from '~/modules/resources/resources.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';
import { UsersModule } from '~/modules/users/users.module';
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
    RecruitmentsModule,
    ResourcesModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const hasPostGIS = await checkPostGISExtension(this.dataSource);
    if (!hasPostGIS) {
      this.logger.error('PostGIS extension is not available in the database.');
    } else {
      this.logger.log('PostGIS extension is available.');
    }
  }
}

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { AppController } from '~/app.controller';
import { AppService } from '~/app.service';
import config from '~/common/config/configuration';
import { checkPostGISExtension } from '~/common/utils/postgis';
import { ArmiesModule } from '~/models/armies/armies.module';
import { AuthModule } from '~/models/auth/auth.module';
import { SettlementsModule } from '~/models/settlements/settlements.module';
import { UsersModule } from '~/models/users/users.module';
import { PostgresDatabaseProviderModule } from '~/providers/database/postgres/provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
      load: [config],
    }),
    PostgresDatabaseProviderModule,
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

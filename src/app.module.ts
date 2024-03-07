import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from '~/app.service';
import { AppController } from '~/app.controller';
import { UsersEntity } from '~/models/user/entities/usersEntity';
import { UsersModule } from '~/models/user/users.module';
import { SettlementEntity } from '~/models/settlement/entities/settlement.entity';
import { SettlementModule } from '~/models/settlement/settlement.module';
import { checkPostGISExtension } from '~/common/utils/postgis';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SettlementModule, UsersModule],
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
        entities: [UsersEntity, SettlementEntity],
      }),
    }),
    UsersModule,
    SettlementModule,
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

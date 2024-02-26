import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppService } from '~/app.service';
import { AppController } from '~/app.controller';
import { UserEntity } from '~/user/entities/user.entity';
import { UserModule } from '~/user/user.module';
import { SettlementEntity } from '~/settlement/entities/settlement.entity';
import { SettlementModule } from '~/settlement/settlement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.production.local'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SettlementModule, UserModule],
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
        entities: [UserEntity, SettlementEntity],
      }),
    }),
    UserModule,
    SettlementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

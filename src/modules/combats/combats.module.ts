import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CombatsController } from '~/modules/combats/combats.controller';
import { CombatsService } from '~/modules/combats/combats.service';
import { SiegeEntity } from '~/modules/combats/entities/siege.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { SettlementsModule } from '~/modules/settlements/settlements.module';
import { UserLocationModule } from '~/modules/user-location/user-location.module';

@Module({
  controllers: [CombatsController],
  imports: [
    TypeOrmModule.forFeature([SiegeEntity]),
    ConfigModule,
    SettlementsModule,
    UserLocationModule,
  ],
  providers: [CombatsService],
  exports: [CombatsService],
})
export class CombatsModule {}

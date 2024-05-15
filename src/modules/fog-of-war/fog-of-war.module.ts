import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CombatsModule } from '~/modules/combats/combats.module';
import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { DiscoveredSettlementsEntity } from '~/modules/fog-of-war/entities/discovered-settlements.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { FogOfWarController } from '~/modules/fog-of-war/fog-of-war.controller';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  controllers: [FogOfWarController],
  imports: [
    CacheRedisProviderModule,
    TypeOrmModule.forFeature([
      DiscoveredAreaEntity,
      VisibleAreaEntity,
      DiscoveredSettlementsEntity,
    ]),
    forwardRef(() => CombatsModule),
  ],
  providers: [FogOfWarService],
  exports: [TypeOrmModule, FogOfWarService],
})
export class FogOfWarModule {}

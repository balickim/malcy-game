import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';
import { FogOfWarController } from '~/modules/fog-of-war/fog-of-war.controller';
import { FogOfWarService } from '~/modules/fog-of-war/fog-of-war.service';
import { CacheRedisProviderModule } from '~/providers/cache/redis/provider.module';

@Module({
  controllers: [FogOfWarController],
  imports: [
    CacheRedisProviderModule,
    TypeOrmModule.forFeature([DiscoveredAreaEntity, VisibleAreaEntity]),
  ],
  providers: [FogOfWarService],
  exports: [TypeOrmModule, FogOfWarService],
})
export class FogOfWarModule {}

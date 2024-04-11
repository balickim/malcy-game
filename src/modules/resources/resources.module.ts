import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResourcesService } from '~/modules/resources/resources.service';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementsEntity])],
  providers: [ResourcesService],
})
export class ResourcesModule {}

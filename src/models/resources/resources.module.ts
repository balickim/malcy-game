import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResourcesService } from '~/models/resources/resources.service';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettlementsEntity])],
  providers: [ResourcesService],
})
export class ResourcesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { ConfigModule } from '~/modules/config/config.module';
import { EventLogEntity } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { QueuesManagerService } from '~/modules/queues-manager/queues-manager.service';
import { RecruitmentsController } from '~/modules/recruitments/recruitments.controller';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { SettlementsService } from '~/modules/settlements/settlements.service';
import { UserLocationService } from '~/modules/user-location/user-location.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArmyEntity, SettlementsEntity, EventLogEntity]),
    ConfigModule,
  ],
  controllers: [RecruitmentsController],
  providers: [
    RecruitmentsService,
    QueuesManagerService,
    SettlementsService,
    UserLocationService,
    EventLogService,
  ],
})
export class RecruitmentsModule {}
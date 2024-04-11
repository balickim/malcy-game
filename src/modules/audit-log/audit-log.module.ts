import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogSubscriber } from '~/modules/audit-log/audit-log.subscriber';

import { AuditLogService } from './audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [AuditLogService, AuditLogSubscriber],
})
export class AuditLogModule {}

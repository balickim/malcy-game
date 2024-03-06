import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { SettlementEntity } from '~/models/settlement/entities/settlement.entity';
import { SettlementGateway } from '~/models/settlement/settlement.gateway';

@EventSubscriber()
export class SettlementSubscriber
  implements EntitySubscriberInterface<SettlementEntity>
{
  constructor(
    dataSource: DataSource,
    private readonly settlementGateway: SettlementGateway,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return SettlementEntity;
  }

  afterInsert(event: InsertEvent<SettlementEntity>): Promise<any> | void {
    this.settlementGateway.server.emit('foo', event.entity);
  }
}

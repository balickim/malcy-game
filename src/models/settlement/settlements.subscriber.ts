import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { SettlementsEntity } from '~/models/settlement/entities/settlements.entity';
import { SettlementsGateway } from '~/models/settlement/settlements.gateway';

@EventSubscriber()
export class SettlementsSubscriber
  implements EntitySubscriberInterface<SettlementsEntity>
{
  constructor(
    dataSource: DataSource,
    private readonly settlementsGateway: SettlementsGateway,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return SettlementsEntity;
  }

  afterInsert(event: InsertEvent<SettlementsEntity>): Promise<any> | void {
    this.settlementsGateway.server.emit('foo', event.entity);
  }
}

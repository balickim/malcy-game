import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsGateway } from '~/models/settlements/settlements.gateway';

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

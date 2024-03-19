import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsGateway } from '~/models/settlements/settlements.gateway';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { Point } from 'geojson';

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

  async afterInsert(event: InsertEvent<SettlementsEntity>) {
    const point = event.entity.location as Point;
    const lng = point.coordinates[0];
    const lat = point.coordinates[1];

    console.log(event.entity);
    const newSettlementData = {
      id: event.entity.id,
      name: event.entity.name,
      type: event.entity.type,
      lng: lng,
      lat: lat,
    };
    this.settlementsGateway.server.emit('newSettlement', newSettlementData);

    const army = new ArmyEntity();
    army.settlement = event.entity;
    army.knights = 0;
    army.archers = 0;
    await event.manager.save(ArmyEntity, army);
  }
}

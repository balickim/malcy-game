import { Point } from 'geojson';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
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

  async afterInsert(event: InsertEvent<SettlementsEntity>) {
    if (process.env.PROCESS_ENV === 'seeding') return; // turn off "afterInsert" while seeding

    const point = event.entity.location as Point;
    const lng = point.coordinates[0];
    const lat = point.coordinates[1];

    const newSettlementData = {
      id: event.entity.id,
      name: event.entity.name,
      type: event.entity.type,
      lng: lng,
      lat: lat,
      user: event.entity.user,
    };
    this.settlementsGateway.server.emit('newSettlement', newSettlementData);

    const army = new ArmyEntity();
    army.settlement = event.entity;
    army.knights = 0;
    army.archers = 0;
    await event.manager.save(ArmyEntity, army);
  }
}

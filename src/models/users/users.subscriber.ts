import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { UsersEntity } from '~/models/users/entities/users.entity';

@EventSubscriber()
export class UsersSubscriber implements EntitySubscriberInterface<UsersEntity> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UsersEntity;
  }

  async afterInsert(event: InsertEvent<UsersEntity>) {
    const army = new ArmyEntity();
    army.user = event.entity;
    await event.manager.save(ArmyEntity, army);
  }
}

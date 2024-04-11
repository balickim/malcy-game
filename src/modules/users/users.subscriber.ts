import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@EventSubscriber()
export class UsersSubscriber implements EntitySubscriberInterface<UsersEntity> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UsersEntity;
  }

  async afterInsert(event: InsertEvent<UsersEntity>) {
    if (process.env.PROCESS_ENV === 'seeding') return; // turn off "afterInsert" while seeding

    const army = new ArmyEntity();
    army.user = event.entity;
    army.knights = 0;
    army.archers = 0;
    await event.manager.save(ArmyEntity, army);
  }
}

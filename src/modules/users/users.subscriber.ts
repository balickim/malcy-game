import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import { ArmyEntity, UnitType } from '~/modules/armies/entities/armies.entity';
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
    army[UnitType.SWORDSMAN] = 0;
    army[UnitType.ARCHER] = 0;
    army[UnitType.KNIGHT] = 0;
    army[UnitType.LUCHADOR] = 0;
    army[UnitType.ARCHMAGE] = 0;
    await event.manager.save(ArmyEntity, army);
  }
}

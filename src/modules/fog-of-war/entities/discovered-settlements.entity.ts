import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import {
  SettlementsEntity,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Entity('discoveredSettlements')
export class DiscoveredSettlementsEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discoveredByUserId: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  settlementId: string;

  @Column()
  type: SettlementTypesEnum;

  @ManyToOne(() => UsersEntity, (user) => user.discoveredSettlements)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(
    () => SettlementsEntity,
    (settlement) => settlement.discoveredByUsers,
  )
  @JoinColumn({ name: 'settlementId' })
  settlement: SettlementsEntity;
}

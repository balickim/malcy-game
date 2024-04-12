import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

export enum UnitType {
  knights = 'knights',
  archers = 'archers',
}

@Entity({ name: 'armies' })
export class ArmyEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  knights: number;

  @Column({ nullable: false })
  archers: number;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  settlementId?: string;

  @OneToOne(() => UsersEntity, (user) => user.army)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @OneToOne(() => SettlementsEntity, (settlement) => settlement.army)
  @JoinColumn({ name: 'settlementId' })
  settlement: SettlementsEntity;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

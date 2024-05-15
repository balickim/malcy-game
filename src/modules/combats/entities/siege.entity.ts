import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { AuditableBaseEntity } from '~/modules/event-log/entities/auditable-base.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';

export enum SiegeStatusEnum {
  ONGOING = 'ONGOING',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
}

@Entity({ name: 'sieges' })
export class SiegeEntity extends AuditableBaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => SettlementsEntity, { eager: true })
  @JoinColumn({ name: 'settlementId' })
  settlement: SettlementsEntity;

  @Column({
    type: 'enum',
    enum: SiegeStatusEnum,
    default: SiegeStatusEnum.ONGOING,
  })
  status: SiegeStatusEnum;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

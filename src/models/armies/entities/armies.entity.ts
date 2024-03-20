import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { UsersEntity } from '~/models/users/entities/users.entity';

@Entity({ name: 'armies' })
export class ArmyEntity {
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

  @ManyToOne(() => UsersEntity, (user) => user.armies)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => SettlementsEntity, (settlement) => settlement.armies)
  @JoinColumn({ name: 'settlementId' })
  settlement: SettlementsEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

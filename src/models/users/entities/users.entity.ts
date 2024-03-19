import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  AfterInsert,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { IsEmail, IsOptional } from 'class-validator';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryColumn()
  id: string;

  @IsOptional()
  @IsEmail()
  @Column({ unique: true, nullable: false })
  nick: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ select: false, nullable: false })
  password: string;

  @OneToMany(() => SettlementsEntity, (settlement) => settlement.user)
  settlements: SettlementsEntity[];

  @OneToMany(() => ArmyEntity, (army) => army.user)
  armies: ArmyEntity[];

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

import { IsEmail, IsOptional, Max, Min } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';

@Entity({ name: 'users' })
@Check(`"gold" >= 0 AND "gold" <= 100000`)
@Check(`"wood" >= 0 AND "wood" <= 80000`)
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

  @Column({ default: 0 })
  @Min(0)
  @Max(100_000)
  gold: number;

  @Column({ default: 0 })
  @Min(0)
  @Max(80_000)
  wood: number;

  @OneToMany(() => SettlementsEntity, (settlement) => settlement.user)
  settlements: SettlementsEntity[];

  @OneToOne(() => ArmyEntity, (army) => army.user)
  army: ArmyEntity;

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

import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  GeoJSON,
} from 'typeorm';
import { nanoid } from 'nanoid';

import { UsersEntity } from '~/models/users/entities/users.entity';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';

export enum SettlementType {
  village = 'village',
  town = 'town',
  city = 'city',
}

@Entity({ name: 'settlements' })
export class SettlementsEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: GeoJSON;

  @Column({
    type: 'enum',
    enum: SettlementType,
    default: SettlementType.village,
  })
  type: SettlementType;

  @ManyToOne(() => UsersEntity, (user) => user.settlements)
  user: UsersEntity;

  @OneToMany(() => ArmyEntity, (army) => army.settlement)
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

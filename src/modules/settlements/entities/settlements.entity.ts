import { Max, Min } from 'class-validator';
import { nanoid } from 'nanoid';
import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  GeoJSON,
  OneToOne,
  Check,
} from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import { UsersEntity } from '~/modules/users/entities/users.entity';

const maxGold = 4_000; // same as in configuration file
const maxWood = 1_000; // same as in configuration file

export enum SettlementType {
  village = 'village',
  town = 'town',
  city = 'city',
}

export enum ResourceType {
  wood = 'wood',
  gold = 'gold',
}

@Entity({ name: 'settlements' })
@Check(`"gold" >= 0 AND "gold" <= ${maxGold}`)
@Check(`"wood" >= 0 AND "wood" <= ${maxWood}`)
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

  @Column({ default: 0 })
  @Min(0)
  @Max(maxGold)
  gold: number;

  @Column({ default: 0 })
  @Min(0)
  @Max(maxWood)
  wood: number;

  @Column({ default: 1, nullable: false })
  @Min(1)
  @Max(10)
  resourcesMultiplicator: number;

  @ManyToOne(() => UsersEntity, (user) => user.settlements)
  user: UsersEntity;

  @OneToOne(() => ArmyEntity, (army) => army.settlement)
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

import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity({ name: 'settlement' })
export class SettlementEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

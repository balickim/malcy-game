import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

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
  location: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

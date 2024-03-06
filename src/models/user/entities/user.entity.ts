import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nick: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}

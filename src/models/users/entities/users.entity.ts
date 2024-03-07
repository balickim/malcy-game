import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsOptional } from 'class-validator';

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

  @Column({ nullable: false, select: false })
  password: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
  @BeforeInsert()
  async hashPasword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

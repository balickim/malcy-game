import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { IsEmail, IsOptional } from 'class-validator';

@Entity({ name: 'users' })
export class UsersEntity {
  @IsOptional()
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

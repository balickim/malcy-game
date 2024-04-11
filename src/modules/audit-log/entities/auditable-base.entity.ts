import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AuditableBaseEntity {
  @Column({ default: 'system' })
  createdBy: string;

  @Column({ default: 'system' })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy?: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

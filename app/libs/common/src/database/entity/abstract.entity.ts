import {
  Column,
  CreateDateColumn,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('uuid', { unique: true, default: () => 'gen_random_uuid()' })
  @Generated('uuid')
  public uuid!: string;

  @CreateDateColumn({ select: false, name: 'created_at' })
  public createdAt!: Date;

  @UpdateDateColumn({ select: false, name: 'updated_at' })
  public updatedAt!: Date;
}

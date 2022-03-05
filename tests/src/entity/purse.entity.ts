import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'purse' })
export class Purse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, default: 0, type: 'integer' })
  balance!: number;

  @Column({ nullable: false})
  userId!: number;

  @ManyToOne(() => User, user => user.purses, {onDelete: "CASCADE"})
  user?: User;
}

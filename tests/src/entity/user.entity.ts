import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Purse } from './purse.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  defaultPurseId?: number;

  @OneToOne(() => Purse, (purse) => purse.user)
  @JoinColumn()
  defaultPurse?: Purse;

  @OneToMany(() => Purse, (purse) => purse.user)
  purses?: Purse[];
}
